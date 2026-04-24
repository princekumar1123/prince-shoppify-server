const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET is not defined in environment");
    return jwt.sign(payload, secretKey, { expiresIn: "12h" });
};

const verifyToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET is not defined in environment");
    return jwt.verify(token, secretKey);
};

module.exports = { generateToken, verifyToken };
