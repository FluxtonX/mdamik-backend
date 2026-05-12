const SupportTicket = require('../models/SupportTicket');

const statusColorMap = {
    Open: '#F28B22',
    'In Progress': '#F28B22',
    Resolved: '#00B16A',
    Closed: '#7A7A7A',
};

const ticketNumber = () => `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

const getRelativeTime = (date) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(date).getTime()) / 1000), 0);
    if (seconds < 60) return 'Today';
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `Today, ${new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};

const withTicketUi = (ticketDoc) => {
    const ticket = ticketDoc.toObject ? ticketDoc.toObject() : ticketDoc;
    return {
        ...ticket,
        ui: {
            title: ticket.subject,
            id: `${ticket.ticketNumber || ticket._id} - ${getRelativeTime(ticket.createdAt)}`,
            status: ticket.status,
            statusColor: statusColorMap[ticket.status] || '#F28B22',
        },
    };
};

/**
 * Create a new support ticket
 */
const createTicket = async (req, res, next) => {
    try {
        const { subject, message, priority, category } = req.body;

        const ticket = new SupportTicket({
            userId: req.user._id,
            ticketNumber: ticketNumber(),
            subject,
            message,
            priority,
            category,
            replies: [{ senderType: 'User', message }],
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: withTicketUi(ticket)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all tickets for current user
 */
const getMyTickets = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId: req.user._id };
        if (status) query.status = status;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await SupportTicket.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tickets.map(withTicketUi),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

const addTicketReply = async (req, res, next) => {
    try {
        const { message } = req.body;
        const ticket = await SupportTicket.findOne({ _id: req.params.ticketId, userId: req.user._id });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Support ticket not found' });
        }

        ticket.replies.push({ senderType: 'User', message });
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
            ticket.status = 'Open';
        }
        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: withTicketUi(ticket),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    addTicketReply,
};
