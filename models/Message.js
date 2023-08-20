const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        creator: {type: Schema.Types.ObjectId, ref: 'User'},
        text: String,
        image: String
    },
    {
        timestamps: true
    }
)

module.exports = model('Message', messageSchema)