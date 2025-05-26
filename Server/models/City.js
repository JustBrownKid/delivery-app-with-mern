const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  short: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  }
});

module.exports = mongoose.model('City', citySchema);
