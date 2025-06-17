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
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  guidance: {
    type: [String],
    required: false,
  },
});

module.exports = mongoose.model("Emotion", emotionSchema);
