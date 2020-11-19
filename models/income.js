const mongoose = require('mongoose');
const Schema = mongoose.Schema({
	income: Number,
	profit: Number,
})

const Income = mongoose.model('Income', Schema)

module.exports = Income