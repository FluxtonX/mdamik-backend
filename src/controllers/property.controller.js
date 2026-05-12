const Property = require('../models/Property');
const PropertyFavorite = require('../models/PropertyFavorite');
const PropertyInquiry = require('../models/PropertyInquiry');

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || 1, 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit || 10, 10), 1), 50);
    return { page, limit, skip: (page - 1) * limit };
};

const formatPrice = (price) => `$${Number(price || 0).toLocaleString('en-US')}`;

const withPropertyUi = (propertyDoc, favoriteIds = new Set()) => {
    const property = propertyDoc.toObject ? propertyDoc.toObject() : propertyDoc;
    const image = property.images && property.images.length > 0
        ? property.images[0]
        : 'assets/images/property_villa.png';

    return {
        ...property,
        isFavorite: favoriteIds.has(property._id.toString()),
        ui: {
            image,
            price: formatPrice(property.price),
            rating: property.rating,
            title: property.title,
            location: property.location,
            beds: property.bedrooms,
            baths: property.bathrooms,
            area: property.area && property.area.value ? property.area.value : 0,
            areaUnit: property.area && property.area.unit ? property.area.unit : 'sqft',
            built: property.yearBuilt,
            agent: property.agent,
        },
    };
};

const getFavoriteIds = async (userId, properties) => {
    if (!userId || properties.length === 0) return new Set();
    const favorites = await PropertyFavorite.find({
        userId,
        propertyId: { $in: properties.map((property) => property._id) },
    }).select('propertyId');

    return new Set(favorites.map((favorite) => favorite.propertyId.toString()));
};

/**
 * Get all properties with optional filtering
 */
const getProperties = async (req, res, next) => {
    try {
        const {
            category,
            type,
            location,
            minPrice,
            maxPrice,
            bedrooms,
            minBedrooms,
            search,
            sort = 'newest',
        } = req.query;
        const query = { isAvailable: true };
        
        if (category && category !== 'All') query.category = category;
        if (type) query.type = type;
        if (location) query.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (bedrooms) {
            query.bedrooms = bedrooms === '4+' ? { $gte: 4 } : Number(bedrooms);
        }
        if (minBedrooms) query.bedrooms = { $gte: Number(minBedrooms) };
        if (search) query.$text = { $search: search };

        const { page, limit, skip } = getPagination(req.query);
        const sortMap = {
            newest: { createdAt: -1 },
            priceAsc: { price: 1 },
            priceDesc: { price: -1 },
            rating: { rating: -1 },
        };

        const properties = await Property.find(query)
            .sort(sortMap[sort] || sortMap.newest)
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments(query);
        const favoriteIds = await getFavoriteIds(req.user && req.user._id, properties);

        res.status(200).json({
            success: true,
            data: properties.map((property) => withPropertyUi(property, favoriteIds)),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
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

        property.views += 1;
        await property.save();
        const favoriteIds = await getFavoriteIds(req.user && req.user._id, [property]);

        res.status(200).json({
            success: true,
            data: withPropertyUi(property, favoriteIds),
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
        const {
            title,
            description,
            price,
            location,
            address,
            category,
            type,
            images,
            rating,
            bedrooms,
            bathrooms,
            area,
            yearBuilt,
            features,
            agent,
        } = req.body;

        const property = new Property({
            userId: req.user._id,
            title,
            description,
            price,
            location,
            address,
            category,
            type,
            images,
            rating,
            bedrooms,
            bathrooms,
            area,
            yearBuilt,
            features,
            agent,
        });

        await property.save();

        res.status(201).json({
            success: true,
            message: 'Property listed successfully',
            data: withPropertyUi(property),
        });
    } catch (error) {
        next(error);
    }
};

const toggleFavorite = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property || !property.isAvailable) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const existing = await PropertyFavorite.findOne({
            userId: req.user._id,
            propertyId: property._id,
        });

        let isFavorite = true;
        if (existing) {
            await existing.deleteOne();
            isFavorite = false;
        } else {
            await PropertyFavorite.create({ userId: req.user._id, propertyId: property._id });
        }

        res.status(200).json({
            success: true,
            message: isFavorite ? 'Property added to favorites' : 'Property removed from favorites',
            data: { propertyId: property._id, isFavorite },
        });
    } catch (error) {
        next(error);
    }
};

const getFavoriteProperties = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const favorites = await PropertyFavorite.find({ userId: req.user._id })
            .populate('propertyId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await PropertyFavorite.countDocuments({ userId: req.user._id });

        const properties = favorites
            .map((favorite) => favorite.propertyId)
            .filter(Boolean);
        const favoriteIds = new Set(properties.map((property) => property._id.toString()));

        res.status(200).json({
            success: true,
            data: properties.map((property) => withPropertyUi(property, favoriteIds)),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

const createInquiry = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property || !property.isAvailable) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const { type, offeredPrice, preferredDate, message, contact } = req.body;
        const inquiry = await PropertyInquiry.create({
            userId: req.user._id,
            propertyId: property._id,
            type,
            offeredPrice,
            preferredDate,
            message,
            contact,
        });

        res.status(201).json({
            success: true,
            message: 'Property inquiry created successfully',
            data: inquiry,
        });
    } catch (error) {
        next(error);
    }
};

const getMyInquiries = async (req, res, next) => {
    try {
        const { status, type } = req.query;
        const { page, limit, skip } = getPagination(req.query);
        const query = { userId: req.user._id };
        if (status) query.status = status;
        if (type) query.type = type;

        const inquiries = await PropertyInquiry.find(query)
            .populate('propertyId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await PropertyInquiry.countDocuments(query);

        res.status(200).json({
            success: true,
            data: inquiries,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    listProperty,
    toggleFavorite,
    getFavoriteProperties,
    createInquiry,
    getMyInquiries,
};
