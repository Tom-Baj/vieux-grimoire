const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Create a schema for the user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, //Check if the email is unique
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);