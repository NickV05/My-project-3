
const Item = require('../models/Item');

const isItemOwner = (req, res, next) => {
console.log("Req.body", req.body)
console.log("Req.user", req.user)
    Item.findById(req.params.itemId)
        .then((foundItem) => {
            if (req.user._id === foundItem.owner.toString()) {
                next()
            } else {
                res.status(401).json({message: "Validation Error"})
            }
        })
        .catch((err) => {
            console.log(err)
            next(err)
        })
}

module.exports = isItemOwner;