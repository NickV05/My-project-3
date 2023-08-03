var express = require('express');
var router = express.Router();

const Cart = require('../models/Cart');

const isAuthenticated = require('../middleware/isAuthenticated');


router.get('/', isAuthenticated, (req, res, next) => {

    const cartId = req.use.cart

    Cart.findById(cartId)
        .populate('socks')
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

router.post('/create', isAuthenticated, (req, res, next) => {

    const { sockId, subtotal, total } = req.body

    // const today = new Date()
    // let expiry = today.setDate(today.getDate() + 1)

    Cart.create({
        owner: req.user._id,
        subtotal, 
        total,
        // timeLeft: expiry,
        $push: {socks: sockId}
    })
        .then((createdCart) => {
            res.json(createdCart)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.post('/update', isAuthenticated, (req, res, next) => {

    const { sockId, subtotal, total } = req.body

    const cartId = req.user.cart
    
    Cart.findByIdAndUpdate(
        cartId,
        {
            subtotal, 
            total,
            $push: {socks: sockId}
        },
        { return: true }
    )
        .populate('socks')
        .then((updatedCart) => {
            res.json(updatedCart)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.post('/remove-sock/:sockId', isAuthenticated, (req, res, next) => {

    const cartId = req.user.cart
    const { sockId } = req.params

    Cart.findByIdAndUpdate(
        cartId,
        {
            $pull: {socks: sockId}
        },
        { new: true }
    )
        .populate('socks')
        .then((updatedCart) => {
            res.json(updatedCart)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

module.exports = router;