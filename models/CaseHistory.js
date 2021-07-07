const mongoose = require('mongoose');
const Schema = mongoose.Schema({
  name: String,
	paid: Number,
	assigned: String,
	description: String,
	date: String,
	number: Number,
})

module.exports = mongoose.model('History', Schema)
