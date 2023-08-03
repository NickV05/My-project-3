const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
    {
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        comment: String
    },
    {
        timeseries: true
    }
)

module.exports = model('Comment', commentSchema)