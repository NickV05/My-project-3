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
    cart: {type: Schema.Types.ObjectId, ref: 'Cart'},
    listedSocks: [{type: Schema.Types.ObjectId, ref: 'Sock'}]
    },
    {
        timeseries: true
    }
  );
  
  module.exports = model("User", userSchema);