const Project = require('../models/Project');

/**
 * Get management statistics for the dashboard
 */
const getManagementStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const stats = await Project.aggregate([
            { $match: { userId: userId, status: 'In Progress' } },
            {
                $group: {
                    _id: null,
                    activeProjects: { $sum: 1 },
                    totalSpent: { $sum: '$totalCost' }, // In a real app, this would be sum of transactions
                    totalTeamMembers: { $sum: '$teamCount' }
                }
            }
        ]);

        const result = stats[0] || { activeProjects: 0, totalSpent: 0, totalTeamMembers: 0 };

        res.status(200).json({
            success: true,
            data: {
                activeProjects: result.activeProjects,
                totalSpent: result.totalSpent,
                teamMembers: result.totalTeamMembers
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all projects with management details
 */
const getManagementProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('name type progress totalCost status statusType teamCount');

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getManagementStats,
    getManagementProjects
};
