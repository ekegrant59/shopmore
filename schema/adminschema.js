const mongoose = require('mongoose')
const mongodb = process.env.MONGODB
mongoose.connect(mongodb)

const adminschema = new mongoose.Schema({
    email: String,
    password: String
})

module.exports = mongoose.model('admin', adminschema)