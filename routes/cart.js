var express = require("express");
var router = express.Router();

const Cart = require("../models/Cart");

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

router.post("/create", isAuthenticated, (req, res, next) => {
  const { itemId, subtotal, total } = req.body;

  console.log("ItemId:", itemId);

  const today = new Date();
  let expiry = today.setDate(today.getDate() + 1);

  Cart.create({
    owner: req.user._id,
    subtotal,
    total,
    timeLeft: expiry,
  })
    .then((createdCart) => {
      createdCart.items.push(itemId);
      createdCart.save().then(() => res.json(createdCart));
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post("/update", isAuthenticated, (req, res, next) => {
  const { itemId, subtotal, total } = req.body;

  const cartId = req.user.cart;

  Cart.findByIdAndUpdate(
    cartId,
    {
      subtotal,
      total,
      $push: { items: itemId },
    },
    { return: true }
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
