const NodeCache = require('node-cache');

// Default cache TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

/**
 * Generic caching wrapper for expensive operations or 3rd party calls
 * @param {string} key - Unique key for the cache
 * @param {Function} fetchFunc - Function to fetch data if not in cache
 * @param {number} [ttl] - Optional TTL in seconds
 */
const getOrFetch = async (key, fetchFunc, ttl) => {
    const value = cache.get(key);
    if (value) {
        return value;
    }

    const result = await fetchFunc();
    cache.set(key, result, ttl);
    return result;
};

/**
 * Middleware to cache specific GET routes
 * @param {number} ttl - TTL in seconds
 */
const cacheMiddleware = (ttl) => {
    return (req, res, next) => {
        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.status(200).json(cachedResponse);
        }

        // Override res.json to capture response
        const originalJson = res.json;
        res.json = (body) => {
            if (res.statusCode === 200 && body.success) {
                cache.set(key, body, ttl);
            }
            return originalJson.call(res, body);
        };
        next();
    };
};

module.exports = {
    cache,
    getOrFetch,
    cacheMiddleware,
};
