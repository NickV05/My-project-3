var express = require("express");
var router = express.Router();

const Cart = require("../models/Cart");
const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/", isAuthenticated, (req, res, next) => {

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

router.post("/update", isAuthenticated, (req, res, next) => {
  const {details, cartId} = req.body;
  console.log("details:",details);
  console.log("cart ID:",cartId);
  console.log("Req.body:",req.body);

  Cart.findByIdAndUpdate(
    cartId,
    {
      // subtotal,
      // total,
      $push: { items: details._id },
    },
    { new: true }
  )
    .populate("items")
    .then((updatedCart) => {
      console.log("updated Cart:",updatedCart)
      res.json(updatedCart);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post("/remove-item/:itemId", isAuthenticated, (req, res, next) => {
  const cartId = req.user.cart;
  const { itemId } = req.params;

  Cart.findByIdAndUpdate(
    cartId,
    {
      $pull: { items: itemId },
    },
    { new: true }
  )
    .populate("items")
    .then((updatedCart) => {
      res.json(updatedCart);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

module.exports = router;
