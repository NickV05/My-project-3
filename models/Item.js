const { Schema, model } = require('mongoose');

const itemSchema = new Schema(
    {
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        cost: {
            type: Number,
            default: 0
        },
        image: String,
        description: String,
        colorPattern: String,
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {
        timeseries: true
    }
)

module.exports = model('Item', itemSchema)