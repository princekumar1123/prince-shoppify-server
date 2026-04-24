const { verifyToken } = require("../services/jwtUtils");
const createError = require("http-errors");

const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createError(401, "Access denied. No token provided."));
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return next(createError(401, "Invalid or expired token."));
    }
};

module.exports = { authenticate };
