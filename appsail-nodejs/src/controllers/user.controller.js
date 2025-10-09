const userModel = require("../models/user.model.js");
const userService = require("../services/user.service.js");

// const userLogin = async (req, res) => {
//     try {
//         const { loginId, password } = req.body;
//         if (!loginId || !password) {
//             return res.status(400).json({
//                 message: "loginId and password are required",
//                 data: null,
//                 success: false,
//                 timestamp: new Date().toISOString(),
//             });
//         }

//         const isEmail = /\S+@\S+\.\S+/.test(loginId);
//         const query = isEmail ? { email: loginId.toLowerCase() } : { mobile: loginId };
//         let user = await userModel.findOne(query);
//         // If user not found → create new user
//         if (!user) {
//             const zohoUser = await userService.userLoginService(loginId);
//             if (!zohoUser) {
//                 return res.status(404).json({
//                     message: "User not found",
//                     data: null,
//                     success: false,
//                     timestamp: new Date().toISOString()
//                 });
//             }
//             const cleanPhone = zohoUser?.Mobile.replace(/\D/g, "");
//             const initialPassword = cleanPhone.slice(-10);
//             console.log(initialPassword)
//             const newUser = new userModel({
//                 firstName: zohoUser.First_Name,
//                 lastName: zohoUser.Last_Name,
//                 fullName: zohoUser.Full_Name,
//                 nationality: zohoUser.Nationality,
//                 dateOfBirth: zohoUser.Date_of_Birth,
//                 visaRefused: zohoUser.F_T_Turned_Down_No_Need,
//                 passportNo: zohoUser.Passport_Number || null,
//                 gender: (zohoUser?.Gender.map(g => g.split('/')[0].trim()))[0],
//                 // age: zohoUser?.age || null,
//                 // bloodGroup: zohoUser.blood_group || null,
//                 email: zohoUser.Email,
//                 mobile: zohoUser.Mobile,
//                 password: initialPassword,
//                 zohoUserId: zohoUser.id,
//             });

//             user = await newUser.save();

//             return res.status(201).json({
//                 message: "New user logged in",
//                 data: {
//                     id: user._id,
//                     fullName: user.fullName,
//                     email: user.email,
//                     phone: user.phone,
//                     zohoUserId: user.zohoUserId,
//                 },
//                 success: true,
//                 timestamp: new Date().toISOString(),
//             });
//         }

//         // Validate password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 message: "Invalid password",
//                 data: null,
//                 success: false,
//                 timestamp: new Date().toISOString(),
//             });
//         }

//         return res.status(200).json({
//             message: "Login successful",
//             data: {
//                 id: user._id,
//                 fullName: user.fullName,
//                 email: user.email,
//                 phone: user.phone,
//                 zohoUserId: user.zohoUserId,
//                 status: user.status,
//             },
//             success: true,
//             timestamp: new Date().toISOString(),
//         });
//     } catch (err) {
//         console.error("Login Error:", err);
//         return res.status(500).json({
//             message: "Internal server error",
//             data: null,
//             success: false,
//             timestamp: new Date().toISOString(),
//         });
//     }
// };

const userLogin = async (req, res) => {
    try {
        const result = await userService.userLoginService(req);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data,
            success: result.success,
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
        const result = await userService.getUserProfileService(req);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("getUserProfile Error:", err.message);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
};

const editUserProfile = async (req, res) => {
    try {
        const result = await userService.editUserProfileService(req);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("editUserProfile Error:", err);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
};

const acroReport = async (req, res) => {
    try {
        const result = await userService.acroReportService(req);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("editUserProfile Error:", err);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
}

const blsAppointment = async (req, res) => {
    try {
        const result = await userService.blsAppointmentService(req);
        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("🔥 blsAppointment Controller Error:", err);
        return res.status(500).json({
            message: "Unexpected server error.",
            data: null,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
};

//not in work as of now.
// const updateProfile = async (req, res) => {
//     const url = "https://static.vecteezy.com/system/resources/previews/032/176/197/non_2x/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg";
//     const { id } = req.params;

//     if (!id) {
//         return res.status(400).json({
//             message: "User ID is required",
//             data: null,
//             success: false,
//             timestamp: new Date().toISOString()
//         });
//     }

//     // Validate file
//     if (!req.file) {
//         return res.status(400).json({
//             message: "Profile image file is required",
//             data: null,
//             success: false,
//             timestamp: new Date().toISOString()
//         });
//     }

//     // Step 1: Check if user exists
//     const user = await userModel.findById(id).lean();
//     if (!user) {
//         return res.status(404).json({
//             message: "User not found",
//             data: null,
//             success: false,
//             timestamp: new Date().toISOString()
//         });
//     }
//     const updatedUser = await userModel.findByIdAndUpdate(
//         id,
//         { profileImage: url },
//         { new: true, lean: true }
//     );
//     return res.status(201).json({
//         message: `Profile updated`,
//         data: null,
//         success: false,
//         timestamp: new Date().toISOString()
//     });
// }

module.exports = {
    userLogin,
    getUserProfile,
    editUserProfile,
    acroReport,
    blsAppointment
};
