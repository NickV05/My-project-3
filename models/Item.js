const { Schema, model } = require('mongoose');

const itemSchema = new Schema(
    {
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        cost:String,
        name:String,
        image: String,
        description: String,
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {
        timeseries: true
    }
)

module.exports = model('Item', itemSchema)