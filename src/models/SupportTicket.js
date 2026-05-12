const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ticketNumber: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    category: {
        type: String,
        enum: ['Payments', 'Labor', 'Materials', 'Transport', 'Account', 'Projects', 'Other'],
        default: 'Other',
    },
    replies: [{
        senderType: { type: String, enum: ['User', 'Support'], default: 'User' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
}, {
    timestamps: true,
});

supportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
