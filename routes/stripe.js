const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const isAuthenticated = require("../middleware/isAuthenticated");
const Cart = require("../models/Cart");

router.post(
  "/create-checkout-session/:cartId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const ourCart = req.body;
      console.log("our cart in stripe:", ourCart);
      console.log("req user:", req.user);
      const lineItems = await Promise.all(
        Object.values(ourCart).map(async (item) => {
          console.log("item:", item);
          const product = await stripe.products.create({
            name: `${item.name} (with taxes)`,
          });
          console.log("Product:", product);
          console.log("Price", (Number(item.cost) * 108).toFixed(0));

          const price = await stripe.prices.create({
            unit_amount: (Number(item.cost) * 108).toFixed(0),
            currency: "usd",
            product: `${product.id}`,
          });
          console.log("Price:", price);

          return { price: price.id, quantity: item.quantity };
        })
      );
      console.log("line items:", lineItems);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URI}/success`,
        cancel_url: `${process.env.CLIENT_URI}/cancel`,
      });
      console.log("Session Id:", session.id);
      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/delete-cart", isAuthenticated, async (req, res, next) => {
  const deleteCart = await Cart.findOneAndDelete({ owner: req.user._id })
    .then((deletedItem) => {
      console.log("IT WORKS");
      if (deletedItem) {
        res.json({ message: "Your cart is empty" });
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

module.exports = router;
