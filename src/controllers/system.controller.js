/**
 * System Controller
 * Provides dynamic data for UI components that are often hardcoded.
 * This includes Categories, Service Bundles, and Help Articles.
 */

const getCategories = (req, res) => {
    const categories = [
        { id: 'construction', label: 'Construction', icon: 'home_repair_service', desc: 'Build your dream project' },
        { id: 'real-estate', label: 'Real Estate', icon: 'real_estate_agent', desc: 'Buy, sell, or rent properties' },
        { id: 'engineering', label: 'Engineering', icon: 'engineering', desc: 'Design & planning' },
        { id: 'materials', label: 'Materials', icon: 'layers', desc: 'Construction supplies' },
        { id: 'excavation', label: 'Excavation', icon: 'construction', desc: 'Excavation services' },
        { id: 'labor', label: 'Labor', icon: 'groups', desc: 'Hire skilled workers' },
        { id: 'transport', label: 'Transport', icon: 'local_shipping', desc: 'Logistics & shipping' },
        { id: 'services', label: 'Services', icon: 'settings_suggest', desc: 'Operations support' },
        { id: 'management', label: 'Management', icon: 'assignment', desc: 'Project oversight' },
        { id: 'financial', label: 'Financial', icon: 'monetization_on', desc: 'Budgeting & costs' },
    ];

    res.status(200).json({ success: true, data: categories });
};

const getBundles = (req, res) => {
    const bundles = [
        { 
            id: 'starter-home', 
            name: 'Starter Home Bundle', 
            desc: 'Architecture + Excavation + Foundation', 
            discount: '15%',
            price: 12000
        },
        { 
            id: 'commercial-pro', 
            name: 'Commercial Pro', 
            desc: 'Full PM + Materials + Labor Management', 
            discount: '20%',
            price: 45000
        }
    ];
    res.status(200).json({ success: true, data: bundles });
};

const getHelpArticles = (req, res) => {
    const articles = [
        { id: 1, topic: 'Payments', title: 'How to pay via MyFawry', content: 'Step by step guide...' },
        { id: 2, topic: 'Labor', title: 'Verifying worker credentials', content: 'Our vetting process...' },
        { id: 3, topic: 'Projects', title: 'Tracking milestones effectively', content: 'Tips for managers...' },
    ];
    res.status(200).json({ success: true, data: articles });
};

module.exports = {
    getCategories,
    getBundles,
    getHelpArticles
};
