const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Materials', 'Labor', 'Engineering', 'Transport', 'Services', 'Contingency', 'Other'],
    },
    type: {
        type: String,
        required: true,
        enum: ['Credit', 'Debit'],
        default: 'Debit',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
