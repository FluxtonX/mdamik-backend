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
        const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: projects,
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

module.exports = {
    createProject,
    getMyProjects,
    getProjectById,
    updateProjectStatus,
};
