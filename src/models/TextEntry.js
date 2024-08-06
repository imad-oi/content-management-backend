const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DuplicateSchema = new mongoose.Schema({
  sourceUuid: String,
  sourceParagraphIndex: Number,
  paragraph: String,
  newTextIndex: Number,
  type: {
    type: String,
    enum: ['exact', 'similar']
  }
}, { _id: false });


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
  duplicates: {
    internal: [DuplicateSchema],
    external: [DuplicateSchema]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TextEntry', TextEntrySchema);