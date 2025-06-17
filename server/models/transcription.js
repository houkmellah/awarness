const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema({
  audioUrl: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Transcription", transcriptionSchema); 