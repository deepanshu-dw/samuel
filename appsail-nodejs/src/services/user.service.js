const { getAccessToken } = require("../configs/zoho.config");

const axios = require('axios');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const documentModel = require("../models/document.model");
const notificationModel = require("../models/notification.model");
const { sendEmail } = require("../configs/email.config");

// const userLoginService = async (loginId) => {
//     try {
//         const token = await getAccessToken();

//         // Determine filter field
//         const isEmail = loginId.includes("@");
//         const criteria = isEmail
//             ? `(Email:equals:${loginId})`
//             : `(Phone:equals:${loginId} or Mobile:equals:${loginId})`;
//         console.log("before data ccess of zoho", Date.now())
//         const { data } = await axios.get(
//             `${process.env.ZOHO_API_BASE}/Contacts/search?criteria=${encodeURIComponent(criteria)}`,
//             { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
//         );
//         console.log("after data ccess of zoho", Date.now())
//         // console.log("data: ", data)
//         if (data?.data?.length > 0) return data.data[0];
//         return null;
//     } catch (err) {
//         console.error("Error fetching user from Zoho:", err.response?.data || err);
//         throw new Error("Error fetching user from Zoho CRM");
//     }
// };

// const getUserByIdService = async (contactId) => {
//     try {
//         const token = await getAccessToken();
//         const { data } = await axios.get(
//             `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
//             { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
//         );

//         // Zoho API returns 'data' array
//         return data?.data?.length ? data.data[0] : null;
//     } catch (err) {
//         console.error("Error fetching user by ID:", err.response?.data || err.message);
//         return null;
//     }
// };

// const userLoginService = async (req) => {
//     const { loginId, password } = req.body;
//     console.log("nside login service ")
//     // 🔹 Step 1: Validate input
//     if (!loginId || !password) {
//         return {
//             statusCode: 400,
//             message: "loginId and password are required",
//             data: null,
//             success: false,
//         };
//     }

//     // 🔹 Step 2: Identify if loginId is email or phone
//     const isEmail = /\S+@\S+\.\S+/.test(loginId);
//     const query = isEmail ? { email: loginId.toLowerCase() } : { mobile: loginId };

//     // 🔹 Step 3: Find user from DB
//     const user = await userModel.findOne(query);
//     if (!user) {
//         return {
//             statusCode: 404,
//             message: "User not found",
//             data: null,
//             success: false,
//         };
//     }

//     // 🔹 Step 4: Compare password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//         return {
//             statusCode: 401,
//             message: "Invalid password",
//             data: null,
//             success: false,
//         };
//     }

//     // 🔹 Step 5: If everything is fine → return success
//     return {
//         statusCode: 200,
//         message: "Login successful",
//         data: {
//             id: user._id,
//             fullName: user.fullName,
//             email: user.email,
//             phone: user.phone,
//             zohoUserId: user.zohoUserId,
//             status: user.status,
//         },
//         success: true,
//     };
// };
// Helper: Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// ✅ MAIN SERVICE
const userLoginService = async (req) => {
    try {
        const { loginId } = req.body;

        if (!loginId) {
            return {
                statusCode: 400,
                message: "Email is required",
                success: false,
                data: null,
            };
        }

        const isEmailValid = /\S+@\S+\.\S+/.test(loginId);
        if (!isEmailValid) {
            return {
                statusCode: 400,
                message: "Invalid email format",
                success: false,
                data: null,
            };
        }

        const email = loginId.toLowerCase();

        // 🔹 Check or create user in local DB
        let user = await userModel.findOne({ email, status: "Active" });
        if (!user) {
            const token = await getAccessToken();
            const criteria = `(Email:equals:${email})`;
            const { data } = await axios.get(
                `${process.env.ZOHO_API_BASE}/Contacts/search?criteria=${encodeURIComponent(criteria)}`,
                { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
            );

            if (data?.data?.length > 0) {
                const zohoUser = data.data[0];
                const newUser = new userModel({
                    firstName: zohoUser.First_Name || null,
                    lastName: zohoUser.Last_Name || null,
                    fullName: zohoUser.Full_Name || null,
                    email: zohoUser.Email || null,
                    mobile: zohoUser.Mobile || zohoUser.Phone || null,
                    nationality: zohoUser.Nationality || null,
                    dateOfBirth: zohoUser.Date_of_Birth || null,
                    zohoUserId: zohoUser.id,
                    profileImage: zohoUser.Profile_Image || null,
                    visaRefused: zohoUser.F_T_Turned_Down_No_Need || false,
                    passportNo: zohoUser.Passport_Number || null,
                    dropBoxFolderId: zohoUser.dropboxextension__Dropbox_Folder_ID,
                    status: zohoUser.Status || "Inactive",
                });
                const newDoc = new documentModel({ userId: newUser._id });
                user = await newUser.save();
                await newDoc.save();
            } else {
                return {
                    statusCode: 404,
                    message: "User not found",
                    success: false,
                    data: null,
                };
            }
        }

        // 🔹 Generate OTP
        const otpValue = 123456; // replace with generateOtp() in prod
        await otpModel.findOneAndUpdate(
            { email },
            { otp: otpValue },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        const emailSent = await sendEmail(
            email,
            "Your OTP Code 🔒",
            `<p>Hi ${user.fullName || "User"},</p>
            <p>Your OTP for login is: <strong>${otpValue}</strong></p>
            <p>If you did not request this, please ignore this email.</p>`
        );

        if (!emailSent) {
            return {
                statusCode: 500,
                message: "Failed to send OTP email",
                success: false,
                data: null,
            };
        }

        return {
            statusCode: 200,
            message: "OTP sent to your email",
            success: true,
            data: {
                email,
                otp: otpValue, // for testing only
                userId: user._id,
            },
        };
    } catch (error) {
        console.error("Login Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal Server Error",
            success: false,
            data: null,
        };
    }
};

const verifyOtpService = async (req) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return {
                statusCode: 400,
                message: "Email and OTP are required",
                success: false,
                data: null
            };
        }

        const user = await userModel.findOne({ email: email.toLowerCase(), status: "Active" });
        if (!user) {
            return {
                statusCode: 404,
                message: "User not found",
                success: false,
                data: null
            };
        }

        const otpRecord = await otpModel.findOne({ email: email.toLowerCase() });
        if (!otpRecord) {
            return {
                statusCode: 404,
                message: "OTP not found or expired",
                success: false,
                data: null
            };
        }

        if (otpRecord.otp !== Number(otp)) {
            return {
                statusCode: 400,
                message: "Invalid OTP",
                success: false,
                data: null
            };
        }

        // 🔹 OTP is correct → delete OTP record
        await otpModel.deleteOne({ _id: otpRecord._id });
        await userModel.findByIdAndUpdate(user._id, { $set: { active: true } })
        // 🔹 Generate JWT tokens
        const payload = { userId: user._id, email: user.email };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET); // never expires

        // Optionally store refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        return {
            statusCode: 200,
            message: "OTP verified successfully",
            success: true,
            data: {
                userId: user._id,
                fullName: user.fullName,
                email: user.email,
                accessToken,
                refreshToken,
            }
        };
    } catch (error) {
        console.error("Verify OTP Service Error:", error);
        return {
            statusCode: 500,
            message: "Internal server error",
            success: false,
            data: null
        };
    }
};

const getUserProfileService = async (req) => {
    const id = req.user.userId;
    // 🔹 Step 1: Validate ID
    if (!id) {
        return {
            statusCode: 400,
            message: "Contact ID is required",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 2: Find user by ID
    const user = await userModel.findOne({ _id: id, active: true }).lean();

    if (!user) {
        return {
            statusCode: 404,
            message: "User not found",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 3: Prepare user profile
    const profile = {
        userId: user._id || null,
        zohoUserId: user.zohoUserId || null,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        email: user.email || null,
        phone: user.phone || user.mobile || null,
        profileImage: user.profileImage?.url || null,
        nationality: user.nationality || null,
        visaRefused: user.visaRefused,
        dateOfBirth: user.dateOfBirth || null,
        passportNumber: user.passportNo || null,
    };

    // 🔹 Step 4: Return success
    return {
        statusCode: 200,
        message: "User profile fetched successfully",
        data: profile,
        success: true,
    };
};

const editUserProfileService = async (req) => {
    const id = req.user.userId;
    const { dateOfBirth, nationality, passportNo, visaRefused } = req.body;

    // 🔹 Step 1: Validate user ID
    if (!id) {
        return {
            statusCode: 400,
            message: "User ID is required",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 2: Validate string fields
    const stringFields = { dateOfBirth, nationality, passportNo };
    const invalidStringField = Object.entries(stringFields).find(
        ([, value]) => value !== undefined && typeof value !== "string"
    );

    if (invalidStringField) {
        const [fieldName] = invalidStringField;
        return {
            statusCode: 400,
            message: `${fieldName} must be a string`,
            data: null,
            success: false,
        };
    }

    // 🔹 Step 3: Validate visaRefused
    if (visaRefused !== undefined && typeof visaRefused !== "boolean") {
        return {
            statusCode: 400,
            message: "visaRefused must be a boolean",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 4: Fetch user from MongoDB
    const user = await userModel.findOne({ _id: id, active: true }).lean();
    if (!user) {
        return {
            statusCode: 404,
            message: "User not found",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 5: Update MongoDB
    const updatedUser = await userModel.findByIdAndUpdate(
        id,
        {
            ...(dateOfBirth && { dateOfBirth }),
            ...(nationality && { nationality }),
            ...(passportNo && { passportNo }),
            ...(visaRefused !== undefined && { visaRefused }),
        },
        { new: true, runValidators: true, lean: true }
    );

    // 🔹 Step 6: Prepare Zoho fields (optional)
    const zohoFields = {
        Date_of_Birth: dateOfBirth || updatedUser.dateOfBirth || null,
        Nationality: nationality || updatedUser.nationality || null,
        Passport_Number: passportNo || updatedUser.passportNo || null,
        F_T_Turned_Down_No_Need:
            visaRefused !== undefined ? visaRefused : updatedUser.visaRefused || false,
    };

    // 🔹 Step 7: Update Zoho CRM (catch errors but don't fail MongoDB update)
    try {
        if (user.zohoUserId) {
            const token = await getAccessToken();
            await axios.put(
                `${process.env.ZOHO_API_BASE}/Contacts/${user.zohoUserId}`,
                { data: [zohoFields] },
                { headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" } }
            );
        }
    } catch (zohoErr) {
        console.warn("Zoho update failed, MongoDB update succeeded");
    }

    // 🔹 Step 8: Prepare response
    const profile = {
        userId: updatedUser._id,
        dateOfBirth: updatedUser.dateOfBirth,
        nationality: updatedUser.nationality,
        passportNumber: updatedUser.passportNo,
        visaRefused: updatedUser.visaRefused,
    };

    return {
        statusCode: 200,
        message: "User profile updated successfully",
        data: profile,
        success: true,
    };
};

const acroReportService = async (req) => {
    try {
        const { userId } = req.user;

        // 🔹 1. Validate input
        if (!userId) {
            return {
                statusCode: 400,
                message: "A valid 'userId' is required.",
                data: null,
                success: false
            };
        }

        // 🔹 2. Check if user exists
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) {
            return {
                statusCode: 404,
                message: "User not found or inactive.",
                data: null,
                success: false
            };
        }

        // 🔹 3. Check Police ACRO status in documentModel
        const userDoc = await documentModel.findOne({ userId });

        if (userDoc?.police_ACRO === "completed") {
            return {
                statusCode: 400,
                message: "ACRO report already completed.",
                data: null,
                success: false
            };
        }

        // 🔹 4. Update Police ACRO status to completed
        await documentModel.findOneAndUpdate(
            { userId },
            { $set: { police_ACRO: "completed" } },
        );

        // 🔹 5. (Optional) Example: Use Zoho API if needed
        try {
            const token = await getAccessToken(); // your token function
            const contactId = user.zohoUserId;

            if (!contactId) {
                console.warn("Zoho Contact ID not found for user:", userId);
            } else {
                // 5a. Fetch existing contact data
                const { data: zohoRes } = await axios.get(`${process.env.ZOHO_API_BASE}/Contacts/${contactId}`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` }
                });

                const contact = zohoRes.data[0];
                let applicationDocuments = contact.Application_Documents || [];

                // 5b. Append POLICE ACRO REPORT if not already present
                if (!applicationDocuments.includes("Police ACRO Report")) {
                    applicationDocuments.push("Police ACRO Report");
                    // 5c. Update Zoho contact
                    await axios.put(`${process.env.ZOHO_API_BASE}/Contacts/${contactId}`, {
                        data: [{ Application_Documents: applicationDocuments }]
                    }, {
                        headers: {
                            Authorization: `Zoho-oauthtoken ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                }
            }
        } catch (zohoErr) {
            console.error("⚠️ Zoho update failed:", zohoErr.response?.data || zohoErr.message);
        }

        return {
            statusCode: 200,
            message: "Police ACRO report marked as completed successfully.",
            data: { userId, status: "completed" },
            success: true
        };

    } catch (err) {
        console.error("🔥 acroReportService Error:", err.response?.data || err.message);
        return {
            statusCode: 500,
            message: "Internal server error while updating ACRO report.",
            data: err.response?.data || null,
            success: false
        };
    }
};

const blsAppointmentService = async (req) => {
    try {
        const { userId } = req.user;
        const { bookingDate, bookingTime } = req.body;
        console.log(userId)
        // 🔹 1. Validate input
        if (!userId) {
            return {
                statusCode: 400,
                message: "A valid 'userId' is required.",
                data: null,
                success: false
            };
        }

        if (!bookingDate || isNaN(Date.parse(bookingDate))) {
            return {
                statusCode: 400,
                message: "A valid appointment 'date' (ISO format) is required.",
                data: null,
                success: false
            };
        }

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!bookingTime || !timeRegex.test(bookingTime)) {
            return {
                statusCode: 400,
                message: "A valid 'bookingTime' (HH:mm, 24-hour format) is required.",
                data: null,
                success: false
            };
        }

        const combinedDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
        if (isNaN(combinedDateTime.getTime())) {
            return {
                statusCode: 400,
                message: "Invalid date or time combination.",
                data: null,
                success: false
            };
        }

        // 🔹 2. Fetch user
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) {
            return {
                statusCode: 404,
                message: "User not found.",
                data: null,
                success: false
            };
        }

        if (!user.zohoUserId) {
            return {
                statusCode: 400,
                message: "User is not linked to a Zoho contact (missing zohoUserId).",
                data: null,
                success: false
            };
        }

        // 🔹 3. Check appointment status in documentModel
        const userDocs = await documentModel.findOne({ userId });
        if (userDocs?.bls_appointment === "completed") {
            return {
                statusCode: 400,
                message: "Your appointment already booked.",
                data: null,
                success: false
            };
        }

        // 🔹 4. Get Zoho Access Token
        const token = await getAccessToken();
        if (!token) {
            return {
                statusCode: 500,
                message: "Unable to retrieve Zoho access token.",
                data: null,
                success: false
            };
        }

        // 🔹 5. Build Zoho Task Payload
        const payload = {
            data: [
                {
                    Subject: `${user.fullName || "Client"} booked BLS Appointment`,
                    Due_Date: new Date(bookingDate).toISOString().split("T")[0], // Zoho expects yyyy-MM-dd
                    Who_Id: { id: user.zohoUserId },
                    Status: "Not Started",
                    Priority: "Normal",
                    Description: `${user.fullName || "User"} booked an appointment for ${bookingDate} at ${bookingTime}.`
                }
            ]
        };

        // 🔹 6. Send request to Zoho CRM
        const response = await axios.post(
            `${process.env.ZOHO_API_BASE}/Tasks`,
            payload,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${token}`,
                    "Content-Type": "application/json"
                },
            }
        );

        const resultData = response.data?.data?.[0];

        if (!resultData || resultData.code !== "SUCCESS") {
            console.error("❌ Zoho appointment creation failed:", response.data);
            return {
                statusCode: 500,
                message: "Failed to book appointment in Zoho CRM.",
                data: response.data,
                success: false
            };
        }

        // 🔹 7. Update BLS appointment status in documentModel
        await documentModel.findOneAndUpdate(
            { userId },
            { $set: { bls_appointment: "completed" } },
        );

        return {
            statusCode: 200,
            message: "Appointment booked successfully in Zoho CRM.",
            data: resultData.details,
            success: true
        };

    } catch (err) {
        console.error("🔥 blsAppointmentService Error:", err.response?.data || err.message);
        return {
            statusCode: 500,
            message: "Internal server error while booking appointment.",
            data: err.response?.data || null,
            success: false
        };
    }
};

const dashboardProgressTrackerService = async (req) => {
    try {
        const { userId } = req.user;
        if (!userId) return { success: false, message: "User ID is required." };

        // Step 1: Find user
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) return { success: false, message: "User not found or inactive." };

        // Step 2: Check required profile fields
        const requiredFields = ["fullName", "email", "mobile", "nationality", "dateOfBirth", "zohoUserId", "passportNo"];
        let profileComplete = true;

        for (let field of requiredFields) {
            if (!user[field] || user[field].toString().trim() === "") {
                profileComplete = false;
                break;
            }
        }

        // Step 3: Get documents uploaded by user
        const documents = await documentModel.findOne({ userId });
        let uploadedDocsCount = 0;
        const totalDocs = 9; // Total expected docs
        let policeACRO = "pending";
        let bls = "pending";
        let healthCertificate = "pending";
        
        if (documents) {
            const docFields = [
                "passport",
                "proof_of_accomodation",
                "proof_of_identity",
                "passport_size_photo",
                "bank_statement",
                "health_insurance",
                "criminal_record",
                "employment_letter",
                "travel_itinerary",
                "police_ACRO",
                "bls_appointment",
                "health_certificate"
            ];

            docFields.forEach((field) => {
                if (["police_ACRO", "bls_appointment", "health_certificate"].includes(field)) {
                    if (documents[field]) {
                        if (field === "police_ACRO") policeACRO = documents[field] || "pending";
                        if (field === "bls_appointment") bls = documents[field] || "pending";
                        if (field === "health_certificate") healthCertificate = documents[field] || "pending";
                    }
                } else {
                    // Count uploaded documents for other fields
                    if (documents[field] && documents[field].length > 0) uploadedDocsCount++;
                }
            });
        }

        // Step 4: Prepare dashboard response
        const dashboard = {
            userId: user._id,
            firstName: user.fullName.split(" ")[0] || "",
            profileSetup: profileComplete ? "completed" : "pending",
            policeACRO,
            bls,
            healthCertificate,
            totalUploadedDoc: uploadedDocsCount,
            totalDoc: totalDocs,
        };

        return { success: true, data: dashboard };
    } catch (error) {
        console.error("Dashboard Tracker Error:", error);
        return { success: false, message: "Something went wrong.", data: null };
    }
};

const getAllNotificationsService = async (req) => {
    try {
        const { userId } = req.user;

        if (!userId) {
            return { success: false, message: "User ID is required.", data: null };
        }

        // Fetch notifications for this user
        const notifications = await notificationModel.find({ userId, status: "Active" })
            .sort({ createdAt: -1 }); // newest first

        return {
            success: true,
            message: "Notifications fetched successfully.",
            data: notifications,
        };
    } catch (error) {
        console.error("🔥 getAllNotificationsService Error:", error);
        return { success: false, message: "Failed to fetch notifications.", data: null };
    }
};

module.exports = {
    userLoginService,
    verifyOtpService,
    getUserProfileService,
    editUserProfileService,
    acroReportService,
    blsAppointmentService,
    dashboardProgressTrackerService,
    getAllNotificationsService
}