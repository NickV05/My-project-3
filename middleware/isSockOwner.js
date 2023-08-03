
const Sock = require('../models/Sock');

const isSockOwner = (req, res, next) => {

    Sock.findById(req.params.id)
        .then((foundSock) => {
            if (req.body.owner === foundSock.owner.toString()) {
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

module.exports = isSockOwner;