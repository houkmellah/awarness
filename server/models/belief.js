const mongoose = require('mongoose');
const { Schema } = mongoose;

const beliefSchema = new Schema({
    belief: {
        type: String,
        required: true,
    },
    belielLevel: {
        type: Number,
        required: false,
    },
    mirrorBelief: {
        type: String,
        required: false,
    },
    mirrorBeliefReason: {
        type: String,
        required: false,
    },
    mirrorResponse: {
        type: String,
        required: false,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Belief", beliefSchema);