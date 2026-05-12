const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: String,
    unit: String,
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.01,
        default: 1,
    },
    lineTotal: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: true });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    items: [cartItemSchema],
    subtotal: {
        type: Number,
        default: 0,
        min: 0,
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0,
    },
    total: {
        type: Number,
        default: 0,
        min: 0,
    },
    currency: {
        type: String,
        default: 'USD',
    },
}, {
    timestamps: true,
});

cartSchema.methods.recalculate = function () {
    this.items.forEach((item) => {
        item.lineTotal = Number((item.unitPrice * item.quantity).toFixed(2));
    });
    this.subtotal = Number(this.items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
    this.total = Number((this.subtotal + this.deliveryFee).toFixed(2));
};

module.exports = mongoose.model('Cart', cartSchema);
