const { mongoose } = require("mongoose");
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
//   color: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: false,
//   },
  user: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Tag", tagSchema);