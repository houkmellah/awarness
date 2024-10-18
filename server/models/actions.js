const { mongoose } = require("mongoose");
const { Schema } = mongoose;

const actionSchema = new Schema({
  action: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Action", actionSchema);
// mongoose.model("Note", noteSchema);
