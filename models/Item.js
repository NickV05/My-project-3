const { Schema, model } = require('mongoose');

const itemSchema = new Schema(
    {
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        cost:String,
        name:String,
        image: {
            type:String,
            default:'https://res.cloudinary.com/dyto7dlgt/image/upload/v1691683955/project3/zemaik7ovkmwmc49kqbb.png'
        },
        description: String,
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {
        timestamps:true
    }
)

module.exports = model('Item', itemSchema)