const mongoose = require('mongoose');

const expectationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expectation', expectationSchema);

