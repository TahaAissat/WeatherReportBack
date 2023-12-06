const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
})

const User = mongoose.model(userSchema, 'users')

module.exports = User