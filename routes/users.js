var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const isProfileOwner = require('../middleware/isProfileOwner');
const fileUploader = require("../middleware/cloudinary");
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

router.get('/user-detail/:userId', (req, res, next) => {

  const { userId } = req.params

  User.findById(userId)
  .populate('listedItems') 
    .then((foundUser) => {
      console.log("FoundUser:", foundUser)
      res.json(foundUser)
    })
    
    .catch((err) => {
      console.log(err)
      next(err)
    })

});

router.post('/user-update/:userId', isAuthenticated, isProfileOwner, (req, res, next) => {

  User.findByIdAndUpdate(req.params.userId, req.body,{new: true})
  .populate('listedItems')
  .then((updatedUser) => {
    console.log("updatedUser====>",updatedUser)
    const { _id, email, fullName, location, image, listedItems, username, follow, followers, conversations } = updatedUser;

    const payload = { _id, email, fullName, location, image, listedItems, username, follow, followers, conversations };

    const authToken = jwt.sign( 
      payload,
      process.env.SECRET,
      { algorithm: 'HS256', expiresIn: "6h" }
    );

        res.status(200).json({ authToken: authToken, user: payload });
  })
  .catch((err) => {
    console.log(err)
  })

})

router.get('/delete/:userId', isAuthenticated, isProfileOwner, (req, res, next) => {

  const { userId } = req.params

    User.findByIdAndDelete(userId)
      .then((deletedUser) => {

        Sock.deleteMany({
          owner: deletedUser._id
        })
          .then((deletedSocks) => {
            console.log("Deleted socks", deletedSocks)
            res.json(deletedUser)
          })
          .catch((err) => {
            console.log(err)
            next(err)
          }) 
          
      })
      .catch((err) => {
        console.log(err)
        next(err)
      })

})

router.post('/imageUpload', fileUploader.single("image"), (req, res, next) => {
  
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  console.log("this is file", req.file)
  res.json({ image: req.file.path });
  
})

router.post(`/follow/:userProfileId`,isAuthenticated, async (req,res,next) => {
  try{
    const { userProfileId } = req.params
    console.log("userProfileId", userProfileId)
    const toBeFollowed = await User.findByIdAndUpdate(userProfileId,
      {
        $push: { followers: req.user._id }
    },
    { new: true }
      );

      toBeFollowed.populate('listedItems')

    const toFollow = await User.findByIdAndUpdate(req.user._id,
      {
        $push: {follow:userProfileId}
      },
      {new:true})

      console.log("toBeFollowed:", toBeFollowed);
      console.log("toFollow:", toFollow);
      res.json(toBeFollowed); 
  }
  catch (err) {
    console.error(err);
    next(err);
}
})

router.post(`/unfollow/:userProfileId`,isAuthenticated, async (req,res,next) => {
  try{
    const { userProfileId } = req.params
    console.log("userProfileId", userProfileId)
    const toBeUnFollowed = await User.findByIdAndUpdate(userProfileId,
      {
        $pull: { followers: req.user._id }
    },
    { new: true }
      );

      toBeUnFollowed.populate('listedItems')

    const toUnFollow = await User.findByIdAndUpdate(req.user._id,
      {
        $pull: {follow:userProfileId}
      },
      {new:true})

      console.log("toBeUnFollowed:", toBeUnFollowed);
      console.log("toUnFollow:", toUnFollow);
      res.json(toBeUnFollowed); 
  }
  catch (err) {
    console.error(err);
    next(err);
}
})

router.get(`/get-convo/:userId`,isAuthenticated, (req, res, next) => {
  const { userId } = req.params
  console.log("Getting conversation");

  Conversation.findOne({
    $or: [
      { userOne: req.user._id, userTwo: userId },
      { userOne: userId, userTwo: req.user._id}
    ]
  })
  .populate({
    path: 'message',
    populate: {
    path: 'creator',
    model: 'User'  
    }
  })
          .then((foundConvo) => {
              console.log("Found convo ===>", foundConvo)
              res.json(foundConvo)
          })
          .catch((err) => {
              console.log(err)
              next(err)
          })
})

router.post(`/send-message/:userId`, isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  const { message } = req.body;

  try {
    console.log("Received message", message);

    const createdMessage = await Message.create({
      creator: req.user._id,
      text: message,
      image: null,
      read: false
    });

    const foundConvo = await Conversation.findOne({
      $or: [
        { userOne: req.user._id, userTwo: userId },
        { userOne: userId, userTwo: req.user._id }
      ]
    }).populate({
      path: 'message',
      populate: {
      path: 'creator',
      model: 'User'
      }
    });

    if (foundConvo) {
      const updatedConvo = await Conversation.findByIdAndUpdate(
        foundConvo._id,
        {
          $push: { message: createdMessage._id }
        },
        { new: true }
      ).populate({
        path: 'message',
        populate: {
        path: 'creator',
        model: 'User'  
        }
      });

      if (updatedConvo) {
        console.log("Updated Convo", updatedConvo);
        res.json(updatedConvo);
      }
    } else {

      const createdConvo = await Conversation.create({
        message: createdMessage._id,
        userOne: req.user._id,
        userTwo: userId
      });
      
      const updatedUserOne = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { conversations: createdConvo._id }
        },
        { new: true });

      const updatedUserTwo = await User.findByIdAndUpdate(
        userId,
          {
            $push: { conversations:createdConvo._id }
          },
          { new: true });

          

      const populatedConvo = await createdConvo.populate('message')

      const responseObj = {
        convo: populatedConvo,
        user: updatedUserOne
      };
      console.log("Updated user 1 ===>",updatedUserOne)
      console.log("Updated user 2 ===>",updatedUserTwo)
      console.log("Created Convo", populatedConvo);
      res.json(responseObj);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
