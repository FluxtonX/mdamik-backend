const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    loadType: {
        type: String,
        required: true,
        enum: ['Material', 'Equipment', 'Worker', 'Waste'],
    },
    description: {
        type: String,
        trim: true,
    },
    weight: {
        type: Number, // in tons
        required: true,
    },
    pickupLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    vehicleType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    estimatedCost: {
        type: Number,
        required: true,
    },
    actualCost: {
        type: Number,
    },
    trackingId: {
        type: String,
    }
}, {
    timestamps: true,
});

// Index for faster lookups
transportSchema.index({ userId: 1, status: 1 });
transportSchema.index({ trackingId: 1 }, { unique: true });

module.exports = mongoose.model('Transport', transportSchema);
