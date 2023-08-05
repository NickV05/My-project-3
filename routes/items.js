var express = require('express');
var router = express.Router();

const Item = require('../models/Item');
const Comment = require('../models/Comment')

const isAuthenticated = require('../middleware/isAuthenticated');
const isItemOwner = require('../middleware/isItemOwner')

router.get('/', (req, res, next) => {

    Item.find()
    .populate('owner')
    .then((allItems) => {
        console.log("Populated owners:",allItems)
        res.json(allItems)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

});

router.post('/new-item', isAuthenticated, (req, res, next) => {

    const {cost, description, name } = req.body


    Item.create(
        { 
            owner:req.user._id, 
            cost, 
            description,
            name
        }
        )
        .then((newItem) => {
            res.json(newItem)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.get('/item-detail/:itemId', (req, res, next) => {

    const { itemId } = req.params

    Item.findById(itemId)
        .populate({
            path: 'comments',
            populate: { path: 'author'}
        })
        .then((foundItem) => {
            res.json(foundItem)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.post('/item-update/:itemId', isAuthenticated, (req, res, next) => {

    const { itemId } = req.params

    const { cost, description, name } = req.body

    Item.findByIdAndUpdate(
        itemId,
        {
            cost, 
            description,
            name  
        },
        { new: true}
    )
        .then((updatedItem) => {
            res.json(updatedItem)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.post('/delete-item/:itemId', isAuthenticated, (req, res, next) => {

    const { itemId } = req.params

    Item.findByIdAndDelete(itemId)
        .then((deletedItem) => {
            res.json(deletedItem)
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })

})

router.post('/add-comment/:itemId', isAuthenticated, (req, res, next) => {

    Comment.create({
        author: req.user._id,
        comment: req.body.comment
    })
        .then((createdComment) => {

            Item.findByIdAndUpdate(
                req.params.sockId,
                {
                    $push: {comments: createdComment._id}
                }
            )
            .populate({
                path: 'comments',
                populate: { path: 'author'}
            })
            .then((updatedItem) => {
                res.json(updatedItem)
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

module.exports = router;