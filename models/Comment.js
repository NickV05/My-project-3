const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
    {
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        comment: String,
        item:{type: Schema.Types.ObjectId, ref: 'Item'}
    },
    {
        timestamps: true
    }
)

module.exports = model('Comment', commentSchema)