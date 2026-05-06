const SupportTicket = require('../models/SupportTicket');

/**
 * Create a new support ticket
 */
const createTicket = async (req, res, next) => {
    try {
        const { subject, message, priority } = req.body;

        const ticket = new SupportTicket({
            userId: req.user._id,
            subject,
            message,
            priority
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket
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
        const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getMyTickets
};
