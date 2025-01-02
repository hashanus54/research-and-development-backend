const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => rateLimit({ windowMs, max, message });

const globalLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again after 15 minutes');
const authLimiter = createLimiter(60 * 60 * 1000, 5, 'Too many login attempts, please try again after 1 hour');

module.exports = {
    globalLimiter,
    authLimiter
};
