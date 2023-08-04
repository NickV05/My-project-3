const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Cart = require('../models/Cart');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/create-checkout-session/:cartId', isAuthenticated, async (req, res, next) => {
    const cartId = req.params.cartId;
    console.log("cart id:", cartId);
    try {
        const ourCart = await Cart.findById(cartId).populate('items');
        console.log("our cart:", ourCart);



        const lineItems = await Promise.all(
            ourCart.items.map(async(item )=> {
                console.log("Item price:",item.cost)
                const product = await stripe.products.create({
                    name: `${item.name}`,
                  });
                  console.log("Product:", product)
    
                  const price = await stripe.prices.create({
                    unit_amount: item.cost,
                    currency: 'usd',
                    product: `${product.id}`,
                  });
                  console.log("Price:", price)
    
                return {price:price.id, quantity:1}
            })); 
        console.log("line items:",lineItems)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URI}/success.html`,
            cancel_url: `${process.env.CLIENT_URI}/cancel.html`,
        });
        console.log("Session Id:", session.id);
        res.json({ url:session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;