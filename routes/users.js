var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const isProfileOwner = require('../middleware/isProfileOwner');
const fileUploader = require("../middleware/cloudinary")

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
    const { _id, email, fullName, location, image, listedItems } = updatedUser;

    const payload = { _id, email, fullName, location, image, listedItems };

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

module.exports = router;
