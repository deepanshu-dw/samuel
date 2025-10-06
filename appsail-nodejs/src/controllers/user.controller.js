const userService = require("../services/user.service.js");

const userLogin = async (req, res) => {
    try {
        const { loginId, password } = req.body;

        if (!loginId || !password) {
            return res.status(400).json({
                message: "loginId and password are required",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        const user = await userService.userLoginService(loginId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        const rawPhone = user.Phone || user.Mobile || "";
        const cleanPhone = rawPhone.replace(/\D/g, "");
        const phoneWithoutCountry = cleanPhone.slice(-10);

        if (password !== phoneWithoutCountry) {
            return res.status(401).json({
                message: "Invalid password",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        // login success
        return res.status(200).json({
            message: "Login successful",
            data: {
                id: user.id,
                fullName: user.Full_Name,
                email: user.Email,
                phone: rawPhone,
                status: user.Status
            },
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Contact ID is required",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        const user = await userService.getUserByIdService(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        const profile = {
            userId: user.id || null,
            name: user.Full_Name || null,
            email: user.Email || null,
            phone: user.Phone || user.Mobile || null,
            profileImage: user.Profile_Image?.url || null,
            nationality: user.Nationality || null,
            passportStatus: null,
            dateOfBirth: user.Date_of_Birth || null,
            passportNumber: user.Passport_Number || null
        };

        return res.status(200).json({
            message: "User profile fetched successfully",
            data: profile,
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("getUserProfile Error:", err.message);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    userLogin,
    getUserProfile
};
