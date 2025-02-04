const { mongoose } = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    note: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    lifeAspect: {
      type: [String],
      required: true,
    },

    people: [
      {
        type: Schema.Types.ObjectId,
        ref: "People",
        required: false,
      },
    ],
    tags: {
      type: [String],
      required: false,
    },
    emotions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Emotion",
        required: false,
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expectations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Expectation",
        required: false,
      },
    ],
    claims: [
      {
        type: Schema.Types.ObjectId,
        ref: "Claim",
        required: false,
      },
    ],
    fears: [
      {
        type: Schema.Types.ObjectId,
        ref: "Fear",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
