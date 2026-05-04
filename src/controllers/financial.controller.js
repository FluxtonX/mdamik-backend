const Transaction = require('../models/Transaction');
const Project = require('../models/Project');

/**
 * Get financial summary for a project
 */
const getProjectFinancials = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({ _id: projectId, userId: req.user._id });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        const transactions = await Transaction.find({ projectId, userId: req.user._id }).sort({ date: -1 });

        // Calculate category-wise spending
        const categorySpending = await Transaction.aggregate([
            { $match: { projectId: project._id, userId: req.user._id } },
            { $group: { _id: '$category', spent: { $sum: '$amount' } } }
        ]);

        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                totalBudget: project.totalCost,
                totalSpent,
                remaining: project.totalCost - totalSpent,
                categorySpending,
                recentTransactions: transactions.slice(0, 5),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Record a new transaction
 */
const recordTransaction = async (req, res, next) => {
    try {
        const { projectId, title, amount, category, type, date } = req.body;

        const transaction = new Transaction({
            projectId,
            userId: req.user._id,
            title,
            amount,
            category,
            type,
            date,
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Transaction recorded successfully',
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProjectFinancials,
    recordTransaction,
};
