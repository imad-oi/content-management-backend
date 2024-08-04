const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TextEntrySchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TextEntry', TextEntrySchema);