const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Chat', 'Project', 'Financial', 'System', 'Offer', 'Support'],
        default: 'System',
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High'],
        default: 'Normal',
    },
    action: {
        routeName: String,
        entityId: String,
        entityType: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
