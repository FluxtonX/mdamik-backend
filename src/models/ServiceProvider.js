const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['SiteService', 'Labor', 'Engineering', 'Excavation', 'Transport'],
        index: true,
    },
    serviceType: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    skills: [{
        type: String,
        trim: true,
        index: true,
    }],
    price: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        unit: { type: String, enum: ['hour', 'day', 'job', 'm3', 'trip'], default: 'day' },
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    experienceYears: {
        type: Number,
        default: 0,
        min: 0,
    },
    completedJobs: {
        type: Number,
        default: 0,
        min: 0,
    },
    distanceKm: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ['AvailableNow', 'AvailableSoon', 'Busy', 'Inactive'],
        default: 'AvailableNow',
        index: true,
    },
    initials: {
        type: String,
        trim: true,
    },
    avatar: String,
    isVerified: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

serviceProviderSchema.index({ category: 1, serviceType: 1, status: 1, rating: -1 });
serviceProviderSchema.index({ name: 'text', serviceType: 'text', skills: 'text' });
serviceProviderSchema.index({ userId: 1, category: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
