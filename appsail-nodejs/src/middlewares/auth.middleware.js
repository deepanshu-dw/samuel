// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js");

const authMiddleware = async (req, res, next) => {
    try {
        // 🔹 1. Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token missing",
                success: false,
                data: null,
                timestamp: new Date().toISOString(),
            });
        }

        const token = authHeader.split(" ")[1];

        // 🔹 2. Decode and verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔹 3. Check if user exists in DB
        const user = await userModel.findOne({ _id: decoded.userId, status: "Active" });
        if (!user) {
            return res.status(403).json({
                message: "Forbidden: User not found or inactive",
                success: false,
                data: null,
                timestamp: new Date().toISOString(),
            });
        }

        // 🔹 4. Attach user info to request object
        req.user = {
            userId: user._id,
            email: user.email,
            fullName: user.fullName,
        };

        // 🔹 5. Proceed to next middleware/controller
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
            data: null,
            timestamp: new Date().toISOString(),
        });
    }
};

module.exports = authMiddleware;
