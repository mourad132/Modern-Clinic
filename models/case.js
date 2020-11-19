const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  	name: String,
	paid: Number,
	assigned: String,
	done: false,
	description: String,
	date: String,
	number: Number,
});

const Case = mongoose.model('Case', Schema);

module.exports = Case;