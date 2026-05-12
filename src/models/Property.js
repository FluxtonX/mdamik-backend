const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
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
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Apartment', 'Villa', 'Land', 'Office', 'House'],
    },
    type: {
        type: String,
        required: true,
        enum: ['Buy', 'Sell', 'Rent'],
    },
    rating: {
        type: Number,
        default: 0,
    },
    bedrooms: {
        type: Number,
        default: 0,
        min: 0,
    },
    bathrooms: {
        type: Number,
        default: 0,
        min: 0,
    },
    area: {
        value: { type: Number, default: 0 },
        unit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
    },
    yearBuilt: {
        type: Number,
    },
    features: [{
        type: String,
        trim: true,
    }],
    agent: {
        name: { type: String, default: 'Sarah Johnson' },
        title: { type: String, default: 'Senior Real Estate Agent' },
        initials: { type: String, default: 'SJ' },
        phone: String,
        email: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    images: [{
        type: String,
    }],
    views: {
        type: Number,
        default: 0,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

propertySchema.index({ category: 1, type: 1, isAvailable: 1, price: 1 });
propertySchema.index({ location: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
