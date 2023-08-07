var express = require("express");
var router = express.Router();

const Cart = require("../models/Cart");
const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/", isAuthenticated, (req, res, next) => {
  const cartId = req.user.cart;

  Cart.findById(cartId)
    .populate("items")
        .then((foundItems) => {
          if (!foundItems) {
            return res.json({ message: "Your cart is empty" });
          }
          console.log("found:", foundItems)
          res.json(foundItems);
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
});

router.post("/create", isAuthenticated, async (req, res, next) => {
  try {
    const details = req.body;
    console.log("Item:", details);

    const createdCart = await Cart.create({
      owner: req.user._id,
      subtotal: details.cost,
      total: Math.floor(details.cost * 1.08),

    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { cart: createdCart._id }, 
      },
      { new: true }
    );

    const populatedUser = await updatedUser.populate({
      path: 'cart', 
      // populate: {path: 'items owner'}
    })

    createdCart.items.push(details._id);
    createdCart.save();

    const populatedCart = await createdCart.populate('items')

    console.log("Created cart:", populatedCart);
    console.log("Updated user:", populatedUser);
    res.json({createdCart, populatedUser});
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/update", isAuthenticated, (req, res, next) => {
  const details = req.body;

  const cartId = req.user.cart;

  Cart.findByIdAndUpdate(
    cartId,
    {
      subtotal,
      total,
      $push: { items: details._id },
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
