// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

require("dotenv").config(); // Ensure env variables are loaded

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Get token from header

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET); // Verify token
        req.user = verified; // Attach user data to request object
        next(); // Proceed to next middleware or route handler
    } catch (error) {
        return res.status(400).json({ error: "Invalid Token" });
    }
};

const adminMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Get token from header
    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET); // Verify token
        req.user = verified; // Attach decoded user data to request object

        // Check if user role is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access Denied. Admins only." });
        }

        next(); // Proceed to next middleware or route handler
    } catch (error) {
        return res.status(400).json({ error: "Invalid Token" });
    }
};

module.exports = { authMiddleware, adminMiddleware };