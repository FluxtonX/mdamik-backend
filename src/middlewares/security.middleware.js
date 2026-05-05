/**
 * Middleware to ensure the authenticated user owns the resource they are trying to access.
 * Expects the resource fetching logic to have attached the resource to `req.resource`
 * or we can dynamically check it, but usually, it's easier to verify after fetching.
 * For now, this is a generic helper or middleware generator.
 */

/**
 * Checks if req.user._id matches the resource's userId.
 * @param {string} resourceUserIdPath - The path in req to find the resource's owner ID (e.g., 'params.userId' or 'resource.userId')
 */
const checkOwnership = (resourceUserIdPath = 'resource.userId') => {
    return (req, res, next) => {
        try {
            // Resolve the path
            const parts = resourceUserIdPath.split('.');
            let ownerId = req;
            for (const part of parts) {
                ownerId = ownerId[part];
                if (!ownerId) break;
            }

            if (!ownerId) {
                return res.status(500).json({
                    success: false,
                    message: 'Server Error: Resource ownership could not be verified.',
                });
            }

            // Convert both to strings for safe comparison
            if (ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have permission to access or modify this resource.',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    checkOwnership,
};
