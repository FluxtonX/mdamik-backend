const mongoose = require('mongoose');

const excavationEstimateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        depth: { type: Number, required: true },
    },
    volume: {
        type: Number,
        required: true,
    },
    excavationType: {
        type: String,
        required: true,
    },
    soilType: {
        type: String,
        required: true,
    },
    ratePerM3: {
        type: Number,
        required: true,
    },
    totalEstimate: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'USD',
    },
}, {
    timestamps: true,
});

excavationEstimateSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ExcavationEstimate', excavationEstimateSchema);
