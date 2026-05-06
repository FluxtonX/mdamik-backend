/**
 * Professional Project Calculator Logic
 * Calculates required quantities based on square footage.
 * Estimates are based on standard construction ratios.
 */

const calculateQuantities = (area) => {
    // Ratios (standard approximations per m2)
    const ratios = {
        cement: 0.4, // bags per m2
        sand: 0.1,   // m3 per m2
        steel: 0.05, // tons per m2
        bricks: 50,  // units per m2
    };

    return {
        area: area,
        units: 'm2',
        recommendations: [
            { material: 'Cement', quantity: Math.ceil(area * ratios.cement), unit: 'bags' },
            { material: 'Sand', quantity: (area * ratios.sand).toFixed(2), unit: 'm3' },
            { material: 'Steel', quantity: (area * ratios.steel).toFixed(2), unit: 'tons' },
            { material: 'Bricks', quantity: Math.ceil(area * ratios.bricks), unit: 'units' },
        ]
    };
};

module.exports = {
    calculateQuantities
};
