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
    images: [{
        type: String,
    }],
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Property', propertySchema);
