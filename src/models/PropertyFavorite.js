const mongoose = require('mongoose');

const propertyFavoriteSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});

propertyFavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('PropertyFavorite', propertyFavoriteSchema);
