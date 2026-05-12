const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
    },
    title: {
        type: String,
        required: true,
    },
    category: String,
    unit: String,
    unitPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    lineTotal: {
        type: Number,
        required: true,
    },
}, { _id: false });

const materialOrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    deliveryAddress: {
        fullName: String,
        phone: String,
        email: String,
        address: String,
        notes: String,
    },
    status: {
        type: String,
        enum: ['Pending Payment', 'Paid', 'Preparing', 'Dispatched', 'Delivered', 'Cancelled'],
        default: 'Pending Payment',
        index: true,
    },
}, {
    timestamps: true,
});

materialOrderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MaterialOrder', materialOrderSchema);
