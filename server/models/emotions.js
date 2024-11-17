const mongoose = require("mongoose");

const emotionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  guidance: {
    type: [String],
    required: false,
  },
});

module.exports = mongoose.model("Emotion", emotionSchema);
