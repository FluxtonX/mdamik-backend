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
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    paymentGateway: {
        type: String,
        enum: ['Stripe', 'MyFawry', 'BangkokBank', 'COD', 'Manual'],
        default: 'Manual',
    },
    referenceId: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});

// State Machine Logic: Prevent invalid status transitions
transactionSchema.pre('save', function () {
    if (!this.isModified('status')) return;

    const oldStatus = this._original ? this._original.status : 'Pending';
    const newStatus = this.status;

    const invalidTransitions = {
        'Completed': ['Pending', 'Processing', 'Failed'],
        'Failed': ['Pending', 'Processing', 'Completed'],
        'Refunded': ['Pending', 'Processing', 'Completed', 'Failed']
    };

    if (invalidTransitions[oldStatus] && invalidTransitions[oldStatus].includes(newStatus)) {
        throw new Error(`Invalid state transition from ${oldStatus} to ${newStatus}`);
    }
});

// Capture original document before save for state machine logic
transactionSchema.post('init', function (doc) {
    doc._original = doc.toObject();
});

module.exports = mongoose.model('Transaction', transactionSchema);
