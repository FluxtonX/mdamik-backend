const Transport = require('../models/Transport');
const transportUtil = require('../utils/transport.util');
const { v4: uuidv4 } = require('uuid');

/**
 * Get transport estimate
 */
const getEstimate = async (req, res, next) => {
    try {
        const { weight, loadType } = req.query;
        if (!weight) {
            return res.status(400).json({ success: false, message: 'Weight is required' });
        }

        const numericWeight = parseFloat(weight);
        const recommendedVehicle = transportUtil.getRecommendedVehicle(numericWeight);
        const estimate = transportUtil.calculateEstimate(numericWeight, recommendedVehicle.type);

        res.status(200).json({
            success: true,
            data: {
                recommendedVehicle: recommendedVehicle.type,
                capacity: recommendedVehicle.capacity,
                estimatedCost: estimate,
                currency: 'USD'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Book transport service
 */
const bookTransport = async (req, res, next) => {
    try {
        const { 
            projectId, 
            loadType, 
            weight, 
            pickupAddress, 
            deliveryAddress, 
            vehicleType 
        } = req.body;

        const estimatedCost = transportUtil.calculateEstimate(weight, vehicleType);

        const transport = new Transport({
            userId: req.user._id,
            projectId,
            loadType,
            weight,
            pickupLocation: { address: pickupAddress },
            deliveryLocation: { address: deliveryAddress },
            vehicleType,
            estimatedCost,
            trackingId: `TRK-${uuidv4().substring(0, 8).toUpperCase()}`
        });

        await transport.save();

        res.status(201).json({
            success: true,
            message: 'Transport booked successfully',
            data: transport
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user transport history
 */
const getMyTransports = async (req, res, next) => {
    try {
        const transports = await Transport.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: transports
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEstimate,
    bookTransport,
    getMyTransports
};
