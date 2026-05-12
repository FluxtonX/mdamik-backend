const mongoose = require('mongoose');

const propertyInquirySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['Tour', 'Offer', 'Message', 'CallRequest'],
        required: true,
        index: true,
    },
    offeredPrice: {
        type: Number,
        min: 0,
    },
    preferredDate: Date,
    message: {
        type: String,
        trim: true,
    },
    contact: {
        fullName: String,
        phone: String,
        email: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Contacted', 'Accepted', 'Rejected', 'Cancelled'],
        default: 'Pending',
        index: true,
    },
}, {
    timestamps: true,
});

propertyInquirySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PropertyInquiry', propertyInquirySchema);
