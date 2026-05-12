const Material = require('../models/Material');
const Professional = require('../models/Professional');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');
const ExcavationEstimate = require('../models/ExcavationEstimate');
const Cart = require('../models/Cart');
const MaterialOrder = require('../models/MaterialOrder');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

const EXCAVATION_TYPES = [
    { key: 'Foundation Excavation', desc: 'For building footings' },
    { key: 'Basement Excavation', desc: 'Deep structural dig' },
    { key: 'Trenching', desc: 'For pipes and cables' },
    { key: 'Road Excavation', desc: 'Sub-base preparation' },
    { key: 'Land Clearing', desc: 'Surface-level clearing' },
];

const SOIL_TYPES = [
    { key: 'Soft Soil', desc: 'Low cost - Fastest', ratePerM3: 10 },
    { key: 'Mixed Soil', desc: 'Medium cost - Moderate', ratePerM3: 15 },
    { key: 'Rocky Soil', desc: 'High cost - Slowest', ratePerM3: 25 },
];

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || 1, 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit || 10, 10), 1), 50);
    return { page, limit, skip: (page - 1) * limit };
};

const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

const formatPriceLabel = (price) => {
    if (!price || price.amount === undefined || price.amount === null || price.amount === 0) return 'Custom Quote';
    const amount = price.amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return `$${amount}/${price.unit || 'day'}`;
};

const withProviderUi = (providerDoc) => {
    const provider = providerDoc.toObject ? providerDoc.toObject() : providerDoc;
    return {
        ...provider,
        ui: {
            initials: provider.initials,
            name: provider.name,
            title: provider.serviceType,
            price: formatPriceLabel(provider.price),
            rating: provider.rating,
            reviews: provider.reviews,
            experience: provider.experienceYears,
            projects: provider.completedJobs,
            jobs: provider.completedJobs,
            distance: `${provider.distanceKm || 0} km`,
            status: provider.status,
        },
    };
};

const normalizeUnitLabel = (unit) => {
    const unitMap = {
        'mÂ³': 'm3',
        'ftÂ²': 'ft2',
    };
    return unitMap[unit] || unit;
};

const withMaterialUi = (materialDoc) => {
    const material = materialDoc.toObject ? materialDoc.toObject() : materialDoc;
    const unit = normalizeUnitLabel(material.unit);
    return {
        ...material,
        ui: {
            image: material.image || 'assets/images/project_home_build.png',
            title: material.title,
            price: `$${Number(material.price || 0).toFixed(2)}`,
            unit,
            category: material.category,
            inStock: material.inStock,
        },
    };
};

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }
    return cart;
};

/**
 * Get all materials with optional filtering by category
 */
const getMaterials = async (req, res, next) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const query = category ? { category } : {};
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const materials = await Material.find(query)
            .sort({ title: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Material.countDocuments(query);

        res.status(200).json({
            success: true,
            data: materials.map(withMaterialUi),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.recalculate();
        await cart.save();

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

const addCartItem = async (req, res, next) => {
    try {
        const { materialId, quantity = 1, projectId } = req.body;
        const numericQuantity = Number(quantity);
        if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
        }

        const material = await Material.findById(materialId);
        if (!material || !material.inStock) {
            return res.status(404).json({ success: false, message: 'Material not found or out of stock' });
        }

        const cart = await getOrCreateCart(req.user._id);
        if (projectId) cart.projectId = projectId;

        const existingItem = cart.items.find((item) => item.materialId.toString() === materialId);
        if (existingItem) {
            existingItem.quantity = Number((existingItem.quantity + numericQuantity).toFixed(2));
        } else {
            cart.items.push({
                materialId,
                title: material.title,
                category: material.category,
                unit: normalizeUnitLabel(material.unit),
                unitPrice: material.price,
                quantity: numericQuantity,
                lineTotal: material.price * numericQuantity,
            });
        }

        cart.recalculate();
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const numericQuantity = Number(quantity);
        if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
        }

        const cart = await getOrCreateCart(req.user._id);
        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        item.quantity = numericQuantity;
        cart.recalculate();
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart item updated', data: cart });
    } catch (error) {
        next(error);
    }
};

const removeCartItem = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        item.deleteOne();
        cart.recalculate();
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart item removed', data: cart });
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.items = [];
        cart.projectId = undefined;
        cart.recalculate();
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
    } catch (error) {
        next(error);
    }
};

const checkoutCart = async (req, res, next) => {
    try {
        const { projectId, currency = 'USD', deliveryAddress = {}, deliveryFee = 0, clearAfterCheckout = true } = req.body;
        const cart = await getOrCreateCart(req.user._id);
        if (cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        cart.projectId = projectId || cart.projectId;
        cart.deliveryFee = Number(deliveryFee) || 0;
        cart.currency = currency;
        cart.recalculate();
        await cart.save();

        const orderNumber = `MAT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const order = await MaterialOrder.create({
            orderNumber,
            userId: req.user._id,
            projectId: cart.projectId,
            items: cart.items.map((item) => ({
                materialId: item.materialId,
                title: item.title,
                category: item.category,
                unit: item.unit,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
            })),
            subtotal: cart.subtotal,
            deliveryFee: cart.deliveryFee,
            total: cart.total,
            currency,
            deliveryAddress,
        });

        const transaction = await Transaction.create({
            projectId: cart.projectId,
            userId: req.user._id,
            title: `Materials Order ${order.orderNumber}`,
            amount: order.total,
            category: 'Materials',
            type: 'Debit',
            currency,
            billingDetails: deliveryAddress,
        });

        order.transactionId = transaction._id;
        await order.save();

        if (clearAfterCheckout) {
            cart.items = [];
            cart.projectId = undefined;
            cart.deliveryFee = 0;
            cart.recalculate();
            await cart.save();
        }

        res.status(201).json({
            success: true,
            message: 'Material order created successfully',
            data: {
                order,
                transaction,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getMyMaterialOrders = async (req, res, next) => {
    try {
        const { status } = req.query;
        const { page, limit, skip } = getPagination(req.query);
        const query = { userId: req.user._id };
        if (status) query.status = status;

        const orders = await MaterialOrder.find(query)
            .populate('transactionId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await MaterialOrder.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all professionals with optional filtering by type
 */
const getProfessionals = async (req, res, next) => {
    try {
        const { type, page = 1, limit = 10 } = req.query;
        const query = type ? { type } : {};
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const professionals = await Professional.find(query)
            .sort({ rating: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Professional.countDocuments(query);

        res.status(200).json({
            success: true,
            data: professionals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getServiceProviders = async (req, res, next) => {
    try {
        const {
            category,
            serviceType,
            skill,
            status,
            availableNow,
            search,
            sort = 'rating',
        } = req.query;
        const { page, limit, skip } = getPagination(req.query);
        const query = {};

        if (category) query.category = category;
        if (serviceType) query.serviceType = new RegExp(serviceType, 'i');
        if (skill && skill !== 'All') query.skills = skill;
        if (status) query.status = status;
        if (availableNow === 'true') query.status = 'AvailableNow';
        if (search) query.$text = { $search: search };

        const sortMap = {
            rating: { rating: -1, reviews: -1 },
            distance: { distanceKm: 1, rating: -1 },
            price: { 'price.amount': 1 },
            jobs: { completedJobs: -1 },
        };

        const providers = await ServiceProvider.find(query)
            .sort(sortMap[sort] || sortMap.rating)
            .skip(skip)
            .limit(limit);
        const total = await ServiceProvider.countDocuments(query);

        res.status(200).json({
            success: true,
            data: providers.map(withProviderUi),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

const registerServiceProvider = async (req, res, next) => {
    try {
        const {
            category = 'Labor',
            serviceType,
            skills = [],
            price,
            experienceYears = 0,
            status = 'AvailableNow',
        } = req.body;

        const provider = await ServiceProvider.findOneAndUpdate(
            { userId: req.user._id, category },
            {
                userId: req.user._id,
                name: req.user.fullName,
                category,
                serviceType,
                skills,
                price,
                experienceYears,
                status,
                initials: getInitials(req.user.fullName),
                isVerified: Boolean(req.user.verification && req.user.verification.phone),
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Provider profile saved successfully',
            data: withProviderUi(provider),
        });
    } catch (error) {
        next(error);
    }
};

const getLaborProviders = async (req, res, next) => {
    req.query.category = 'Labor';
    return getServiceProviders(req, res, next);
};

const createHireRequest = async (req, res, next) => {
    try {
        const {
            providerId,
            projectId,
            serviceType,
            scheduleType = 'OneTime',
            startDate,
            quantity,
            location,
            notes,
        } = req.body;

        const provider = await ServiceProvider.findById(providerId);
        if (!provider || provider.status === 'Inactive') {
            return res.status(404).json({ success: false, message: 'Service provider not found' });
        }

        const quantityValue = quantity && Number(quantity.value) > 0 ? Number(quantity.value) : 1;
        const estimatedCost = provider.price.amount * quantityValue;

        const request = await ServiceRequest.create({
            userId: req.user._id,
            providerId,
            projectId,
            serviceType: serviceType || provider.serviceType,
            scheduleType,
            startDate,
            quantity,
            location,
            notes,
            estimatedCost,
            currency: provider.price.currency,
        });

        await request.populate('providerId');
        const responseData = request.toObject();
        responseData.provider = withProviderUi(request.providerId);

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

const getMyHireRequests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const { page, limit, skip } = getPagination(req.query);
        const query = { userId: req.user._id };
        if (status) query.status = status;

        const requests = await ServiceRequest.find(query)
            .populate('providerId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await ServiceRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            data: requests.map((request) => {
                const item = request.toObject();
                item.provider = item.providerId ? withProviderUi(item.providerId) : null;
                return item;
            }),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

const getExcavationOptions = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            excavationTypes: EXCAVATION_TYPES,
            soilTypes: SOIL_TYPES,
        },
    });
};

const createExcavationEstimate = async (req, res, next) => {
    try {
        const {
            projectId,
            length,
            width,
            depth,
            excavationType,
            soilType,
            persist = false,
        } = req.body;

        const dimensions = [length, width, depth].map(Number);
        if (dimensions.some((value) => !Number.isFinite(value) || value <= 0)) {
            return res.status(400).json({ success: false, message: 'Length, width, and depth must be positive numbers' });
        }

        const selectedSoil = SOIL_TYPES.find((soil) => soil.key === soilType);
        if (!selectedSoil) {
            return res.status(400).json({ success: false, message: 'Invalid soil type' });
        }

        const selectedType = EXCAVATION_TYPES.find((type) => type.key === excavationType);
        if (!selectedType) {
            return res.status(400).json({ success: false, message: 'Invalid excavation type' });
        }
        if (persist && !req.user) {
            return res.status(401).json({ success: false, message: 'Authentication is required to save excavation estimates' });
        }

        const volume = dimensions[0] * dimensions[1] * dimensions[2];
        const totalEstimate = volume * selectedSoil.ratePerM3;
        const data = {
            projectId,
            dimensions: { length: dimensions[0], width: dimensions[1], depth: dimensions[2] },
            volume,
            excavationType,
            soilType,
            ratePerM3: selectedSoil.ratePerM3,
            totalEstimate,
            currency: 'USD',
        };

        const estimate = persist
            ? await ExcavationEstimate.create({ userId: req.user._id, ...data })
            : data;

        res.status(200).json({
            success: true,
            data: estimate,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Seed initial data (for development)
 */
const seedData = async (req, res, next) => {
    try {
        // Materials
        const materialsCount = await Material.countDocuments();
        if (materialsCount === 0) {
            await Material.insertMany([
                { title: 'Portland Cement 50kg', category: 'Cement', price: 12.50, unit: 'bag' },
                { title: 'Steel Rebar 12mm', category: 'Steel', price: 8.75, unit: 'rod' },
                { title: 'Ceramic Tiles 60x60', category: 'Ceramic', price: 22.00, unit: 'box' },
                { title: 'Fine Sand 1m³', category: 'Sand', price: 35.00, unit: 'm³' },
            ]);
        }

        // Professionals
        const profsCount = await Professional.countDocuments();
        if (profsCount === 0) {
            await Professional.insertMany([
                { name: 'Eng. Ahmed Ali', type: 'Engineer', title: 'Civil Engineer', price: 45, rating: 4.8, reviews: 124, experience: '8 Years', projectsCount: 42 },
                { name: 'Sarah Hassan', type: 'Architect', title: 'Senior Architect', price: 60, rating: 4.9, reviews: 89, experience: '10 Years', projectsCount: 31 },
                { name: 'Expert Team', type: 'Contractor', title: 'General Contractor', price: 35, rating: 4.7, reviews: 210, experience: '15 Years', projectsCount: 156 },
            ]);
        }

        const providersCount = await ServiceProvider.countDocuments();
        if (providersCount === 0) {
            await ServiceProvider.insertMany([
                { name: 'Clean Services', category: 'SiteService', serviceType: 'Cleaning Services', skills: ['Cleaning'], price: { amount: 150, unit: 'day' }, rating: 4.9, reviews: 234, experienceYears: 8, distanceKm: 2.3, completedJobs: 456, initials: 'CS' },
                { name: 'Secure Guard', category: 'SiteService', serviceType: 'Security Services', skills: ['Security'], price: { amount: 200, unit: 'day' }, rating: 4.9, reviews: 234, experienceYears: 8, distanceKm: 2.3, completedJobs: 456, initials: 'SC' },
                { name: 'Power Setup', category: 'SiteService', serviceType: 'Utility Setup', skills: ['Utility', 'Electrical'], price: { amount: 200, unit: 'day' }, rating: 4.9, reviews: 234, experienceYears: 8, distanceKm: 2.3, completedJobs: 456, initials: 'PS' },
                { name: 'Safety Care', category: 'SiteService', serviceType: 'Safety Inspection', skills: ['Safety'], price: { amount: 120, unit: 'day' }, rating: 4.9, reviews: 234, experienceYears: 5, distanceKm: 2.3, completedJobs: 23, initials: 'SI' },
                { name: 'Ahmed Hassan', category: 'Labor', serviceType: 'Mason', skills: ['Mason'], price: { amount: 45, unit: 'day' }, rating: 4.9, reviews: 128, experienceYears: 8, distanceKm: 1.2, completedJobs: 156, initials: 'AH' },
                { name: 'Mohammed Ali', category: 'Labor', serviceType: 'Electrician', skills: ['Electrician'], price: { amount: 38, unit: 'day' }, rating: 4.8, reviews: 95, experienceYears: 6, distanceKm: 2.5, completedJobs: 98, initials: 'MA' },
                { name: 'Omar Khaled', category: 'Labor', serviceType: 'Plumber', skills: ['Plumber'], price: { amount: 35, unit: 'day' }, rating: 4.7, reviews: 67, experienceYears: 5, distanceKm: 3.1, completedJobs: 72, initials: 'OK', status: 'AvailableSoon' },
                { name: 'Youssef Ibrahim', category: 'Labor', serviceType: 'Painter', skills: ['Painter'], price: { amount: 28, unit: 'day' }, rating: 4.6, reviews: 54, experienceYears: 4, distanceKm: 4.8, completedJobs: 58, initials: 'YI', status: 'Busy' },
                { name: 'Karim Mostafa', category: 'Labor', serviceType: 'Carpenter', skills: ['Carpenter'], price: { amount: 42, unit: 'day' }, rating: 4.9, reviews: 112, experienceYears: 10, distanceKm: 0.8, completedJobs: 145, initials: 'KM' },
                { name: 'DigMaster Crew', category: 'Excavation', serviceType: 'Foundation Excavation', skills: ['Foundation Excavation', 'Mixed Soil'], price: { amount: 15, unit: 'm3' }, rating: 4.8, reviews: 76, experienceYears: 9, distanceKm: 3.4, completedJobs: 88, initials: 'DM' },
                { name: 'Ahmed Ali', category: 'Engineering', serviceType: 'Design & Planning', skills: ['Architect', 'Blueprints'], price: { amount: 120, unit: 'job' }, rating: 4.9, reviews: 156, experienceYears: 12, completedJobs: 89, initials: 'AA' },
                { name: 'Sarah Khan', category: 'Engineering', serviceType: 'Design & Planning', skills: ['Structural Engineer'], price: { amount: 100, unit: 'job' }, rating: 4.8, reviews: 142, experienceYears: 10, completedJobs: 76, initials: 'SK' },
                { name: 'Hassan Raza', category: 'Engineering', serviceType: 'Cost Estimation', skills: ['Quantity Surveyor'], price: { amount: 80, unit: 'job' }, rating: 4.9, reviews: 178, experienceYears: 15, completedJobs: 112, initials: 'HR' },
                { name: 'Imran Khan', category: 'Engineering', serviceType: 'Site Supervision', skills: ['Site Engineer'], price: { amount: 2500, unit: 'job' }, rating: 4.9, reviews: 201, experienceYears: 14, completedJobs: 145, initials: 'IK' },
                { name: 'Dr. Kamran Ali', category: 'Engineering', serviceType: 'Expert Consultation', skills: ['Structural Consultant'], price: { amount: 150, unit: 'hour' }, rating: 5, reviews: 89, experienceYears: 20, completedJobs: 156, initials: 'KA' },
                { name: 'BuildPro Solutions', category: 'Engineering', serviceType: 'Turnkey Projects', skills: ['Turnkey Contractor'], price: { amount: 0, unit: 'job' }, rating: 4.9, reviews: 234, experienceYears: 18, completedJobs: 167, initials: 'BS' },
            ]);
        }

        res.status(200).json({
            success: true,
            message: 'Data seeded successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMaterials,
    getProfessionals,
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkoutCart,
    getMyMaterialOrders,
    getServiceProviders,
    registerServiceProvider,
    getLaborProviders,
    createHireRequest,
    getMyHireRequests,
    getExcavationOptions,
    createExcavationEstimate,
    seedData,
};
