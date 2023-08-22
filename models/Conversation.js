const { Schema, model } = require('mongoose');

const conversationSchema = new Schema(
    {
        userOne: {type: Schema.Types.ObjectId, ref: 'User'},
        message: [{type: Schema.Types.ObjectId, ref: 'Message'}],
        userTwo: {type: Schema.Types.ObjectId, ref: 'User'},
        topic:String,
    },
    {
        timestamps: true
    }
)

module.exports = model('Conversation', conversationSchema)