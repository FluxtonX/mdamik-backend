const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    preferences: {
        language: { type: String, enum: ['en', 'ar'], default: 'en' },
        region: { type: String, default: 'Sudan' },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    },
    verification: {
        phone: { type: Boolean, default: false },
        email: { type: Boolean, default: false },
        nationalId: { type: Boolean, default: false },
        business: { type: Boolean, default: false },
        progress: { type: Number, default: 0 } // e.g. 3/6
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
