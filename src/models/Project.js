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
        enum: ['Concrete', 'Sand', 'Backfill', 'Mortar'],
    },
    status: {
        type: String,
        enum: ['Setup', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Setup',
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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
