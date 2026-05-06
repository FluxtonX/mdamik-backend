/**
 * Vehicle configuration and cost calculation logic.
 * In a production app, these could be managed via an Admin DB,
 * but cached in memory for zero-latency retrieval.
 */

const VEHICLE_TYPES = [
    { type: 'Pickup Truck', capacity: 1, baseRate: 20, ratePerTon: 10 },
    { type: 'Light Truck', capacity: 3, baseRate: 50, ratePerTon: 8 },
    { type: 'Heavy Truck', capacity: 10, baseRate: 150, ratePerTon: 5 },
    { type: 'Flatbed Trailer', capacity: 25, baseRate: 400, ratePerTon: 3 },
];

/**
 * Calculate estimated cost for transport
 * Logic: Base Rate + (Weight * RatePerTon) + (Distance Factor - simulated for now)
 */
const calculateEstimate = (weight, vehicleType) => {
    const vehicle = VEHICLE_TYPES.find(v => v.type === vehicleType);
    if (!vehicle) return 0;
    
    const cost = vehicle.baseRate + (weight * vehicle.ratePerTon);
    return Math.round(cost * 100) / 100;
};

const getRecommendedVehicle = (weight) => {
    return VEHICLE_TYPES.find(v => v.capacity >= weight) || VEHICLE_TYPES[VEHICLE_TYPES.length - 1];
};

module.exports = {
    VEHICLE_TYPES,
    calculateEstimate,
    getRecommendedVehicle
};
