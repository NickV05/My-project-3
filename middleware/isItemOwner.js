
const Item = require('../models/Item');

const isItemOwner = (req, res, next) => {

    Item.findById(req.params.id)
        .then((foundItem) => {
            if (req.body.owner === foundItem.owner.toString()) {
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