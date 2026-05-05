const Material = require('../models/Material');
const Professional = require('../models/Professional');

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
            data: materials,
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
    seedData,
};
