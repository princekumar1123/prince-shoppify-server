const createError = require("http-errors");

const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, "Authentication required."));
    }
    if (req.user.role !== "admin") {
        return next(createError(403, "Access denied. Admins only."));
    }
    next();
};

module.exports = { verifyAdmin };
