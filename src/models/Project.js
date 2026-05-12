const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['House', 'Apartment', 'Building', 'Factory', 'Shop', 'Roads', 'Gardens', 'Warehouse'],
    },
    services: [{
        type: String,
        enum: ['Engineering', 'Materials', 'Labor', 'Finishing'],
    }],
    area: {
        type: Number,
        required: true,
    },
    materialType: {
        type: String,
        required: true,
        enum: ['Concrete', 'Sand', 'Backfill', 'Mortar', 'Steel', 'Brick', 'Wood'],
    },
    status: {
        type: String,
        enum: ['Setup', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Setup',
    },
    statusType: {
        type: String,
        enum: ['On Track', 'Delayed', 'At Risk', 'Behind Schedule'],
        default: 'On Track',
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
    },
    teamCount: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
    },
    targetDate: {
        type: Date,
    },
    phase: {
        type: String,
        default: 'Phase 1',
        trim: true,
    },
    totalCost: {
        type: Number,
        default: 0,
    },
    costBreakdown: {
        materials: { type: Number, default: 0 },
        labor: { type: Number, default: 0 },
        engineering: { type: Number, default: 0 },
        finishing: { type: Number, default: 0 },
    },
    milestones: [{
        title: { type: String, required: true },
        description: String,
        status: { 
            type: String, 
            enum: ['Pending', 'In Progress', 'Completed'], 
            default: 'Pending' 
        },
        targetDate: Date,
        progress: { type: Number, default: 0, min: 0, max: 1 },
        actionRequired: { type: Boolean, default: false },
        actionDesc: String,
        completedAt: Date,
    }],
    teamMembers: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        initials: { type: String },
        phone: String,
        email: String,
        status: {
            type: String,
            enum: ['Active', 'Invited', 'Inactive'],
            default: 'Active',
        },
    }],
    pendingActions: [{
        title: { type: String, required: true },
        description: String,
        type: {
            type: String,
            enum: ['Approval', 'Payment', 'Material', 'Inspection', 'General'],
            default: 'General',
        },
        status: {
            type: String,
            enum: ['Pending', 'Resolved', 'Dismissed'],
            default: 'Pending',
        },
        dueDate: Date,
    }]
}, {
    timestamps: true,
});

projectSchema.index({ userId: 1, status: 1, createdAt: -1 });
projectSchema.index({ userId: 1, statusType: 1 });

module.exports = mongoose.model('Project', projectSchema);
