const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    serviceType: {
        type: String,
        required: true,
        trim: true,
    },
    scheduleType: {
        type: String,
        enum: ['OneTime', 'Recurring'],
        default: 'OneTime',
    },
    startDate: Date,
    quantity: {
        value: Number,
        unit: String,
    },
    location: {
        address: String,
        lat: Number,
        lng: Number,
    },
    notes: {
        type: String,
        trim: true,
    },
    estimatedCost: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
        index: true,
    },
}, {
    timestamps: true,
});

serviceRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
