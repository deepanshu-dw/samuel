const userModel = require("../models/user.model.js");
const userService = require("../services/user.service.js");

const bcrypt = require('bcrypt');

const userLogin = async (req, res) => {
    try {
        const { loginId, password } = req.body;
        if (!loginId || !password) {
            return res.status(400).json({
                message: "loginId and password are required",
                data: null,
                success: false,
                timestamp: new Date().toISOString(),
            });
        }

        const isEmail = /\S+@\S+\.\S+/.test(loginId);
        const query = isEmail ? { email: loginId.toLowerCase() } : { phone: loginId };

        let user = await userModel.findOne(query);

        // If user not found → create new user
        if (!user) {
            const zohoUser = await userService.userLoginService(loginId);
            if (!zohoUser) {
                return res.status(404).json({
                    message: "User not found",
                    data: null,
                    success: false,
                    timestamp: new Date().toISOString()
                });
            }

            const cleanPhone = loginId.replace(/\D/g, "");
            const initialPassword = cleanPhone.slice(-10);

            const newUser = new userModel({
                firstName: zohoUser.First_Name,
                lastName: zohoUser.Last_Name,
                fullName: zohoUser.Full_Name,
                nationality: zohoUser.Nationality,
                dateOfBirth: zohoUser.Date_of_Birth,
                visaRefused: zohoUser.F_T_Turned_Down_No_Need,
                passportNo: zohoUser.Passport_Number || null,
                gender: (zohoUser?.Gender.map(g => g.split('/')[0].trim()))[0],
                // age: zohoUser?.age || null,
                // bloodGroup: zohoUser.blood_group || null,
                email: zohoUser.Email,
                phone: zohoUser.Phone,
                password: initialPassword,
                zohoUserId: zohoUser.id,
            });

            user = await newUser.save();

            return res.status(201).json({
                message: "New user logged in",
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    zohoUserId: user.zohoUserId,
                },
                success: true,
                timestamp: new Date().toISOString(),
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
                data: null,
                success: false,
                timestamp: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            message: "Login successful",
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                zohoUserId: user.zohoUserId,
                status: user.status,
            },
            success: true,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
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

        const user = await userModel.findById(id).lean();
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

const editUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { dateOfBirth, nationality, passportNo, visaRefused } = req.body;

        const stringFields = { dateOfBirth, nationality, passportNo };

        const invalidStringField = Object.entries(stringFields).find(
            ([key, value]) => value !== undefined && typeof value !== "string"
        );

        if (invalidStringField) {
            const [fieldName] = invalidStringField;
            return res.status(400).json({
                message: `${fieldName} must be a string`,
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        if (visaRefused !== undefined && typeof visaRefused !== "boolean") {
            return res.status(400).json({
                message: "visaRefused must be a boolean",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        if (!id) {
            return res.status(400).json({
                message: "User ID is required",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        // Step 1: Check if user exists
        const user = await userModel.findById(id).lean();
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                data: null,
                success: false,
                timestamp: new Date().toISOString()
            });
        }

        // Step 2: Update user
        const updatedUser = await userModel.findByIdAndUpdate(
            id, {
            ...(dateOfBirth && { dateOfBirth: dateOfBirth }),
            ...(nationality && { nationality: nationality }),
            ...(passportNo && { passportNo: passportNo }),
            ...(visaRefused && { visaRefused: visaRefused }),
        }, { new: true, runValidators: true, lean: true });

        // Return updated profile
        const profile = {
            userId: updatedUser._id,
            dateOfBirth: updatedUser.dateOfBirth || null,
            nationality: updatedUser.nationality || null,
            passportNumber: updatedUser.passportNo || null,
            visaRefused: updatedUser.visaRefused || null
        };

        return res.status(200).json({
            message: "User profile updated successfully",
            data: profile,
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("editUserProfile Error:", err);
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
    getUserProfile,
    editUserProfile
};
