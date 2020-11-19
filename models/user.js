const mongoose = require('mongoose');
const Schema = mongoose.Schema({
	name: String,
	password: String,
	cases: [],
	assgined: [],
})

module.exports = mongoose.model('User', Schema)