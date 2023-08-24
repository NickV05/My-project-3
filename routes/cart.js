var express = require("express");
var router = express.Router();

const Cart = require("../models/Cart");
const Item = require("../models/Item")

const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/", isAuthenticated, (req, res, next) => {

  console.log("Getting cart")

        Cart.findOne({
          owner: req.user._id
      })
          .populate('items')
          .then((foundCart) => {
              if(!foundCart) {
                  return res.json({message: 'Your cart is empty'})
              }
              res.json(foundCart)
          })
          .catch((err) => {
              console.log(err)
              next(err)
          })
  
  });

router.post("/create", isAuthenticated, async (req, res, next) => {
  console.log("Req body ===>", req.body)
  try {
    const details = req.body.details;
    console.log("Item:", details);

    const createdCart = await Cart.create({
      owner: req.user._id,
      subtotal: details.cost,
      total: Math.floor(details.cost * 1.08),
    });

    createdCart.items.push(details._id);
    createdCart.save();

    const populatedCart = await createdCart.populate('items')

    console.log("Created cart:", populatedCart);

    res.json(createdCart);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/update', isAuthenticated, async (req, res, next) => {

  try {

      const { itemId, cartId, itemCost } = req.body

      const toUpdate = await Cart.findById(cartId)
  
      toUpdate.subtotal = parseFloat(toUpdate.subtotal) + parseFloat(itemCost);
      toUpdate.total = Math.floor(parseFloat(toUpdate.subtotal) * 1.08);
      toUpdate.items.push(itemId)

      const newCart = await toUpdate.save()
  
      const populated = await newCart.populate('items')
          console.log("Populated:",populated)
          res.json(populated)

  } catch (err) {
      
      res.redirect(307, '/cart/create')
      console.log(err)
      next(err)
  }

})

router.post("/remove-item/:itemId", isAuthenticated, (req, res, next) => {
  const { itemId } = req.params;  
  const cartId = Object.keys(req.body)[0]

  console.log("Cart ID:", cartId);
  console.log("Req body:", req.body);

  Cart.findByIdAndUpdate(
    cartId,
    {
      $pull: { items: itemId },
    },
    { new: true }
  )
    .populate("items")
    .then((updatedCart) => {
      console.log("updatedCart:", updatedCart)
      if(!updatedCart.items.length){
        Cart.findByIdAndDelete(cartId)
        .then((deletedCart) => {
            if (deletedCart) {
              console.log("Deleted cart ===>",deletedCart)
                res.json(null);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
      }
      else{
        const newSubtotal = updatedCart.items.reduce((acc, item) => {
          return acc + parseFloat(item.cost);
        }, 0);

        const newTotal = Math.floor(newSubtotal * 1.08);

        Cart.findByIdAndUpdate(
          cartId,
          {
            subtotal:newSubtotal,
            total:newTotal,
          },
          { new: true }
        ).populate('items')
        .then((newCart) => {
          console.log("newCart ===>", newCart)
          res.json(newCart);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });

      }
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post("/increase-item/:itemId", isAuthenticated, async(req, res, next) => {

  try {
    const { itemId } = req.params;
    const cartId = Object.keys(req.body)[0];

    const thisItem = await Item.findById(itemId)

    const thisCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        $push: { items: itemId },
      },
      { new: true }
    ).populate("items");

    
    const cost = parseFloat(thisItem.cost);

    thisCart.subtotal += cost;
    thisCart.total = Math.floor(thisCart.subtotal * 1.08);

    const newCart = await thisCart.save();
    console.log("New cart ====>", newCart);
    res.json(newCart);

  } catch (err) {
    console.log(err);
    res.json(err);
    next(err);
  }
})

router.post("/decrease-item/:itemId", isAuthenticated, async (req, res, next) => {

  try {

      const { itemId } = req.params;
      const cartId = Object.keys(req.body)[0]

      const thisCart = await Cart.findById(cartId)
      const populated = await thisCart.populate("items");

      const itemsArray = populated.items

      const thisIndex =  itemsArray.findIndex((element) => element._id.toString() === itemId)
      const thisItem = itemsArray.find((element) => element._id.toString() === itemId)
      console.log("This index ===>",thisIndex)
      console.log("This item ===>",thisItem)

      itemsArray.splice(thisIndex, 1)

      

      populated.subtotal -= thisItem.cost
      populated.total = Math.floor(populated.subtotal * 1.08)
      populated.items = itemsArray


      const newCart = await populated.save()

      console.log("New cart ====>", newCart)

      if(!newCart.items.length){
        Cart.findByIdAndDelete(cartId)
        .then((deletedCart) => {
            if (deletedCart) {
              console.log("Deleted cart ===>",deletedCart)
                res.json(null);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
      }

      else{res.json(newCart)}


  } catch (err) {
      console.log(err)
      res.json(err)
      next(err)
  }})

module.exports = router;