const { Schema, model } = require('mongoose');

const itemSchema = new Schema(
    {
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        cost:String,
        name:String,
        image: {
            type:String,
            default:'https://res.cloudinary.com/dyto7dlgt/image/upload/v1691526882/project3/noImg_uga9rb.jpg'
        },
        description: String,
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {
        timeseries: true
    }
)

module.exports = model('Item', itemSchema)