const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET is not defined in environment");
    const expiresIn = process.env.JWT_EXPIRES_IN || "12h";
    return jwt.sign(payload, secretKey, { expiresIn });
};

const verifyToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET is not defined in environment");
    return jwt.verify(token, secretKey);
};

const verifyRefreshToken = (token) => {
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    if (!secretKey) throw new Error("REFRESH_TOKEN_SECRET is not defined in environment");
    return jwt.verify(token, secretKey);
};

module.exports = { generateToken, verifyToken, verifyRefreshToken };
