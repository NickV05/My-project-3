const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
    email: { 
        type: String, 
        unique: true, 
        required: true },
    password: { 
        type: String, 
        required: true },
    fullName: String,
    location: String,
    username: String,
    image:{
        type:String,
        default:'https://res.cloudinary.com/dyto7dlgt/image/upload/v1691526692/project3/avatar_h1b0st.jpg'
    },
    listedItems: [{type: Schema.Types.ObjectId, ref: 'Item'}],
    follow: [{type: Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    conversations: [{type: Schema.Types.ObjectId, ref: 'Conversation'}]
    },
    {
        timestamps:true
    }
  );
  
  module.exports = model("User", userSchema);