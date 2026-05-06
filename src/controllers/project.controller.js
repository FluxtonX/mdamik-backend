const Project = require('../models/Project');

/**
 * Create a new project
 */
const createProject = async (req, res, next) => {
    try {
        const { name, type, services, area, materialType, totalCost, costBreakdown } = req.body;

        const newProject = new Project({
            userId: req.user._id,
            name,
            type,
            services,
            area,
            materialType,
            totalCost,
            costBreakdown,
        });

        await newProject.save();

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: newProject,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all projects for the logged-in user
 */
const getMyProjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const projects = await Project.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Project.countDocuments({ userId: req.user._id });

        res.status(200).json({
            success: true,
            data: projects,
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
 * Get project details by ID
 */
const getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update project status
 */
const updateProjectStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { status },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project status updated',
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

const calculatorUtil = require('../utils/calculator.util');

/**
 * Calculate recommended quantities based on area
 */
const calculateProjectQuantities = async (req, res, next) => {
    try {
        const { area } = req.query;
        if (!area) {
            return res.status(400).json({ success: false, message: 'Area is required' });
        }

        const data = calculatorUtil.calculateQuantities(parseFloat(area));

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update project milestone status
 */
const updateMilestone = async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;
        const { status, actionRequired, actionDesc } = req.body;

        const project = await Project.findOne({ _id: projectId, userId: req.user._id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const milestone = project.milestones.id(milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        if (status) milestone.status = status;
        if (actionRequired !== undefined) milestone.actionRequired = actionRequired;
        if (actionDesc) milestone.actionDesc = actionDesc;

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Milestone updated',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProject,
    getMyProjects,
    getProjectById,
    updateProjectStatus,
    calculateProjectQuantities,
    updateMilestone,
};
