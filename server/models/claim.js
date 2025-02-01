const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClaimSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Claim = mongoose.model("Claim", ClaimSchema);

module.exports = Claim;
