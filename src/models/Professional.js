const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Engineer', 'Architect', 'Contractor', 'Laborer', 'Electrician', 'Plumber'],
    },
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
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
    experience: {
        type: String,
        required: true,
    },
    projectsCount: {
        type: Number,
        default: 0,
    },
    avatar: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Professional', professionalSchema);
