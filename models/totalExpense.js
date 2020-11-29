const mongoose = require('mongoose');
const Schema = mongoose.Schema({
  total: 0
});

module.exports = mongoose.model('Total Expense', Schema)
