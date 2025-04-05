// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load env variables
const Permission = require("../Models/Permission"); // Import Permission model

const checkPermission = async(req, res, next) => {
    const token = req.header("Authorization"); // Get token from header

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        // Verify JWT and extract user role
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        const user_role = req.user.role;

        // Extract requested route
        let requestedRoute = req.route.path.replace(/^\//, ""); // Remove leading slash

        if (!user_role) {
            return res.status(403).json({ error: "Access Denied. No role assigned." });
        }

        console.log("User Role:", user_role);
        console.log("Requested Route:", requestedRoute);

        //return res.status(200).json({ user_role, requestedRoute });
        // Check if user role is valid

        // Query permissions collection properly using `$in`
        const permission = await Permission.findOne({
            user_roles: { $in: [user_role] }, // Ensure role is in the array
            access: { $in: [requestedRoute] }, // Ensure route exists in access array
        });

        if (!permission) {
            return res.status(403).json({ error: "Forbidden: You do not have access to this resource." });
        }

        next(); // Proceed to the next middleware or route

    } catch (error) {
        return res.status(400).json({ error: "Invalid Token", message: error.message });
    }
};

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


module.exports = { authMiddleware, adminMiddleware, checkPermission };