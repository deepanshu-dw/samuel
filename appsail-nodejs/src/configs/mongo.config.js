const mongoose = require("mongoose");

module.exports = async () => {
    try {
        // Validate MongoDB URL
        if (!process.env.MONGODB_URL || typeof process.env.MONGODB_URL !== "string") {
            throw new Error("MONGODB_URL is missing or invalid in environment variables.");
        }

        // Recommended options for stable connection
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.error("❌ DATABASE CONNECTION ERROR:", error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
};
