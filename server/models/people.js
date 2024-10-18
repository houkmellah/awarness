const { mongoose } = require("mongoose");
const { Schema } = mongoose;

const peopleSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  secondName: {
    type: String,
    required: false,
  },
  nickName: {
    type: String,
    required: false,
  },
  user: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("People", peopleSchema);