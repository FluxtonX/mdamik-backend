const Project = require('../models/Project');
const Transaction = require('../models/Transaction');

const formatMoney = (amount) => {
    const value = Number(amount || 0);
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return `$${value.toLocaleString('en-US')}`;
};

const getCurrentMilestone = (project) => {
    const milestones = project.milestones || [];
    return milestones.find((item) => item.status === 'In Progress')
        || milestones.find((item) => item.status === 'Pending')
        || milestones[milestones.length - 1]
        || null;
};

const withProjectUi = async (projectDoc, userId) => {
    const project = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
    const spentRow = await Transaction.aggregate([
        { $match: { userId, projectId: projectDoc._id, type: 'Debit' } },
        { $group: { _id: '$projectId', spent: { $sum: '$amount' } } },
    ]);
    const spent = spentRow[0] ? spentRow[0].spent : 0;
    const currentMilestone = getCurrentMilestone(project);

    return {
        ...project,
        spent,
        remaining: Math.max((project.totalCost || 0) - spent, 0),
        currentMilestone,
        ui: {
            title: project.name,
            subtitle: `${project.type} - ${project.phase || 'Phase 1'}`,
            progress: project.progress,
            progressPercent: Math.round((project.progress || 0) * 100),
            status: project.statusType,
            budget: formatMoney(project.totalCost),
            spent: formatMoney(spent),
            teamCount: project.teamCount || (project.teamMembers ? project.teamMembers.length : 0),
            currentMilestone: currentMilestone ? {
                id: currentMilestone._id,
                title: currentMilestone.title,
                progress: currentMilestone.progress,
                progressPercent: Math.round((currentMilestone.progress || 0) * 100),
                targetDate: currentMilestone.targetDate,
                status: currentMilestone.status,
            } : null,
        },
    };
};

/**
 * Create a new project
 */
const createProject = async (req, res, next) => {
    try {
        const {
            name,
            type,
            services,
            area,
            materialType,
            totalCost,
            costBreakdown,
            phase,
            startDate,
            targetDate,
            milestones,
            teamMembers,
            pendingActions,
        } = req.body;

        const newProject = new Project({
            userId: req.user._id,
            name,
            type,
            services,
            area,
            materialType,
            totalCost,
            costBreakdown,
            phase,
            startDate,
            targetDate,
            milestones,
            teamMembers,
            teamCount: teamMembers ? teamMembers.length : 0,
            pendingActions,
        });

        await newProject.save();

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: await withProjectUi(newProject, req.user._id),
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
            data: await Promise.all(projects.map((project) => withProjectUi(project, req.user._id))),
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
            data: await withProjectUi(project, req.user._id),
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
            { returnDocument: 'after' }
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
