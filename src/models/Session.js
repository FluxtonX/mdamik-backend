const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    device: {
        name: String, // e.g. iPhone 14 Pro
        os: String,
        ip: String,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });

module.exports = mongoose.model('Session', sessionSchema);
