const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Cement', 'Steel', 'Sand', 'Ceramic', 'Brick', 'Wood', 'Glass', 'Other'],
    },
    price: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
        enum: ['bag', 'rod', 'box', 'm³', 'unit', 'ft²'],
    },
    image: {
        type: String,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Material', materialSchema);
