const Property = require('../models/Property');

/**
 * Get all properties with optional filtering
 */
const getProperties = async (req, res, next) => {
    try {
        const { category, type, location } = req.query;
        const query = { isAvailable: true };
        
        if (category && category !== 'All') query.category = category;
        if (type) query.type = type;
        if (location) query.location = new RegExp(location, 'i');

        const properties = await Property.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: properties,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get property details by ID
 */
const getPropertyById = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id).populate('userId', 'fullName phoneNumber');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        res.status(200).json({
            success: true,
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List a new property (Sell/Rent)
 */
const listProperty = async (req, res, next) => {
    try {
        const { title, description, price, location, category, type, images } = req.body;

        const property = new Property({
            userId: req.user._id,
            title,
            description,
            price,
            location,
            category,
            type,
            images,
        });

        await property.save();

        res.status(201).json({
            success: true,
            message: 'Property listed successfully',
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    listProperty,
};
