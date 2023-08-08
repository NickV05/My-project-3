const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/create-checkout-session/:cartId', isAuthenticated, async (req, res, next) => {
    try {
        const ourCart = req.body;
        console.log("our cart in stripe:", ourCart);
        const lineItems = await Promise.all(
            Object.values(ourCart).map(async(item )=> {
                console.log("item:", item)
                const product = await stripe.products.create({
                    name: `${item.name}`,
                  });
                  console.log("Product:", product)
    
                  const price = await stripe.prices.create({
                    unit_amount: Number(item.cost) * 100,
                    currency: 'usd',
                    product: `${product.id}`,
                  });
                  console.log("Price:", price)
    
                return {price:price.id, quantity:item.quantity}
            })); 
        console.log("line items:",lineItems)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URI}/`,
            cancel_url: `${process.env.CLIENT_URI}/`,
        });
        console.log("Session Id:", session.id);
        res.json({ url:session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;