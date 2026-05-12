const Project = require('../models/Project');
const Transaction = require('../models/Transaction');

const formatMoney = (amount) => {
    const value = Number(amount || 0);
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return `$${value.toLocaleString('en-US')}`;
};

const statusColorMap = {
    'On Track': '#00B16A',
    Delayed: '#FB8C00',
    'At Risk': '#F28B22',
    'Behind Schedule': '#E53935',
};

const getDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
};

const getCurrentMilestone = (project) => {
    const milestones = project.milestones || [];
    return milestones.find((item) => item.status === 'In Progress')
        || milestones.find((item) => item.status === 'Pending')
        || milestones[milestones.length - 1]
        || null;
};

const withProjectManagementUi = (projectDoc, spent = 0) => {
    const project = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
    const currentMilestone = getCurrentMilestone(project);
    const pendingAction = (project.pendingActions || []).find((action) => action.status === 'Pending')
        || (project.milestones || []).find((milestone) => milestone.actionRequired);

    return {
        ...project,
        spent,
        remaining: Math.max((project.totalCost || 0) - spent, 0),
        currentMilestone,
        ui: {
            title: project.name,
            type: project.type,
            subtitle: `${project.type} - ${project.phase || 'Phase 1'}`,
            progress: project.progress,
            progressPercent: Math.round((project.progress || 0) * 100),
            budget: formatMoney(project.totalCost),
            spent: formatMoney(spent),
            teamCount: project.teamCount || (project.teamMembers ? project.teamMembers.length : 0),
            status: project.statusType,
            statusColor: statusColorMap[project.statusType] || '#F28B22',
            daysRemaining: getDaysRemaining(project.targetDate),
            currentMilestone: currentMilestone ? {
                id: currentMilestone._id,
                title: currentMilestone.title,
                description: currentMilestone.description,
                progress: currentMilestone.progress,
                progressPercent: Math.round((currentMilestone.progress || 0) * 100),
                targetDate: currentMilestone.targetDate,
                status: currentMilestone.status,
            } : null,
            pendingAction: pendingAction ? {
                id: pendingAction._id,
                title: pendingAction.title || 'Pending Action Required',
                description: pendingAction.description || pendingAction.actionDesc,
                type: pendingAction.type || 'General',
            } : null,
            teamPreview: (project.teamMembers || []).slice(0, 5).map((member) => ({
                initials: member.initials,
                name: member.name,
                role: member.role,
            })),
        },
    };
};

const getProjectSpendMap = async (userId, projectIds) => {
    if (projectIds.length === 0) return new Map();
    const rows = await Transaction.aggregate([
        { $match: { userId, projectId: { $in: projectIds }, type: 'Debit' } },
        { $group: { _id: '$projectId', spent: { $sum: '$amount' } } },
    ]);

    return new Map(rows.map((row) => [row._id.toString(), row.spent]));
};

/**
 * Get management statistics for the dashboard
 */
const getManagementStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const activeProjects = await Project.find({ userId, status: 'In Progress' })
            .select('_id teamCount teamMembers pendingActions statusType name')
            .lean();
        const projectIds = activeProjects.map((project) => project._id);
        const spendMap = await getProjectSpendMap(userId, projectIds);
        const totalSpent = Array.from(spendMap.values()).reduce((sum, value) => sum + value, 0);
        const teamMembers = activeProjects.reduce(
            (sum, project) => sum + (project.teamCount || (project.teamMembers ? project.teamMembers.length : 0)),
            0
        );
        const attentionProjects = activeProjects.filter((project) =>
            project.statusType !== 'On Track'
            || (project.pendingActions || []).some((action) => action.status === 'Pending')
        );

        res.status(200).json({
            success: true,
            data: {
                activeProjects: activeProjects.length,
                totalSpent,
                teamMembers,
                attentionCount: attentionProjects.length,
                attentionMessage: attentionProjects.length > 0
                    ? `${attentionProjects.length} Project Requires Attention`
                    : 'All projects are on track',
                ui: {
                    activeProjects: activeProjects.length.toString(),
                    totalSpent: formatMoney(totalSpent),
                    teamMembers: teamMembers.toString(),
                    attentionMessage: attentionProjects.length > 0
                        ? `${attentionProjects.length} Project Requires Attention`
                        : 'All projects are on track',
                    attentionDescription: attentionProjects[0]
                        ? `${attentionProjects[0].name} requires review`
                        : 'No pending project actions',
                },
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
        const { status = 'In Progress', page = 1, limit = 10 } = req.query;
        const parsedPage = Math.max(parseInt(page, 10), 1);
        const parsedLimit = Math.min(Math.max(parseInt(limit, 10), 1), 50);
        const query = { userId: req.user._id };
        if (status && status !== 'All') query.status = status;

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit);
        const total = await Project.countDocuments(query);
        const spendMap = await getProjectSpendMap(req.user._id, projects.map((project) => project._id));

        res.status(200).json({
            success: true,
            data: projects.map((project) => withProjectManagementUi(project, spendMap.get(project._id.toString()) || 0)),
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                pages: Math.ceil(total / parsedLimit),
            },
        });
    } catch (error) {
        next(error);
    }
};

const getManagementProjectDetails = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const spendMap = await getProjectSpendMap(req.user._id, [project._id]);
        res.status(200).json({
            success: true,
            data: withProjectManagementUi(project, spendMap.get(project._id.toString()) || 0),
        });
    } catch (error) {
        next(error);
    }
};

const addTeamMember = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const { name, role, initials, phone, email, status } = req.body;
        project.teamMembers.push({ name, role, initials, phone, email, status });
        project.teamCount = project.teamMembers.length;
        await project.save();

        res.status(201).json({
            success: true,
            message: 'Team member added',
            data: project.teamMembers[project.teamMembers.length - 1],
        });
    } catch (error) {
        next(error);
    }
};

const createProjectAction = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const { title, description, type, dueDate } = req.body;
        project.pendingActions.push({ title, description, type, dueDate });
        await project.save();

        res.status(201).json({
            success: true,
            message: 'Project action created',
            data: project.pendingActions[project.pendingActions.length - 1],
        });
    } catch (error) {
        next(error);
    }
};

const resolveProjectAction = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const action = project.pendingActions.id(req.params.actionId);
        if (!action) {
            return res.status(404).json({ success: false, message: 'Project action not found' });
        }

        action.status = req.body.status || 'Resolved';
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project action updated',
            data: action,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getManagementStats,
    getManagementProjects,
    getManagementProjectDetails,
    addTeamMember,
    createProjectAction,
    resolveProjectAction,
};
