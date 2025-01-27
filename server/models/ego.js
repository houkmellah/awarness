const mongoose = require('mongoose');
const { Schema } = mongoose;

const EgoSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: false
    },
    note: [{
        type: Schema.Types.ObjectId,
        ref: 'Note',
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Ego = mongoose.model('Ego', EgoSchema);

module.exports = Ego;