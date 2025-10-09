const { getAccessToken } = require("../configs/zoho.config");

const axios = require('axios');
const bcrypt = require('bcrypt');


const userModel = require("../models/user.model");

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

const userLoginService = async (req) => {
    const { loginId, password } = req.body;
    console.log("nside login service ")
    // 🔹 Step 1: Validate input
    if (!loginId || !password) {
        return {
            statusCode: 400,
            message: "loginId and password are required",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 2: Identify if loginId is email or phone
    const isEmail = /\S+@\S+\.\S+/.test(loginId);
    const query = isEmail ? { email: loginId.toLowerCase() } : { mobile: loginId };

    // 🔹 Step 3: Find user from DB
    const user = await userModel.findOne(query);
    if (!user) {
        return {
            statusCode: 404,
            message: "User not found",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 4: Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return {
            statusCode: 401,
            message: "Invalid password",
            data: null,
            success: false,
        };
    }

    // 🔹 Step 5: If everything is fine → return success
    return {
        statusCode: 200,
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
    };
};

const getUserProfileService = async (req) => {
    const { id } = req.params;

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
    const user = await userModel.findById(id).lean();

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
        visaRefused: user.visaRefused || null,
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
    const { id } = req.params;
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
    const user = await userModel.findById(id).lean();
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
    const token = await getAccessToken();
    console.log("token: ", token);
    // const response = await axios.get(
    //     `${process.env.ZOHO_API_BASE}/settings/fields?module=Contacts`,
    //     { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    // );

    // console.log(response);
    // return response;
}

// const blsAppointmentService = async (req) => {
//     const { userId, date } = req.body;

//     if (!userId || !date) {
//         return {
//             statusCode: 400,
//             message: "userId and date are required",
//             data: null,
//             success: false
//         };
//     }
//     console.log("userId, date: ", userId, date)
//     const user = await userModel.findById(userId);
//     console.log("user: ", user)
//     if (!user) {
//         return {
//             statusCode: 404,
//             message: "No user found",
//             data: null,
//             success: false
//         };
//     }

//     try {
//         const token = await getAccessToken();
//         const response = await axios.post(`${process.env.ZOHO_API_BASE}/Tasks`, {
//             data: [{
//                 Subject: `${user.fullName} booked BLS Appointment`,
//                 Due_Date: date,
//                 // What_Id: { id: '45556000062001234' }, // Optional: related to Deal/Account
//                 Who_Id: { id: user.zohoUserId }, // Optional: related Contact/Lead
//                 // Owner: { id: '45556000059725012' }, // Task owner
//                 Status: 'Not Started',
//                 Priority: 'Normal',
//                 Description: `Client has booken this appointment for ${date}`
//             }]
//         }, {
//             headers: {
//                 Authorization: `Zoho-oauthtoken ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const appointment = response.data?.data?.length ? response.data.data[0] : null;
//         // let appointment = false
//         if (!appointment) {
//             return {
//                 statusCode: 500,
//                 message: "Failed to book appointment in Zoho",
//                 data: null,
//                 success: false
//             };
//         }

//         return {
//             statusCode: 200,
//             message: "Appointment booked successfully",
//             data: appointment,
//             success: true
//         };

//     } catch (err) {
//         console.log(err)
//         // console.error("bookAppointmentService Error:", err.response?.data || err.message);
//         return {
//             statusCode: 500,
//             message: "Internal server error",
//             data: null,
//             success: false
//         };
//     }
// };

const blsAppointmentService = async (req) => {
    try {
        const { userId, bookingDate, bookingTime } = req.body;

        // 🔹 1. Validate input
        if (!userId || typeof userId !== "string") {
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
        // 🔹 2.5. Validate bookingTime (must be in HH:mm format, 24-hour)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!bookingTime || !timeRegex.test(bookingTime)) {
            return {
                statusCode: 400,
                message: "A valid 'bookingTime' (HH:mm, 24-hour format) is required.",
                data: null,
                success: false
            };
        }

        // ✅ Optional: Combine into full ISO datetime for storage or Zoho
        const combinedDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
        if (isNaN(combinedDateTime.getTime())) {
            return {
                statusCode: 400,
                message: "Invalid date or time combination.",
                data: null,
                success: false
            };
        }


        // console.log("📅 Booking BLS appointment for user:", userId, "on", bookingDate);

        // 🔹 2. Fetch user
        const user = await userModel.findById(userId);
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

        // 🔹 3. Get Zoho Access Token
        const token = await getAccessToken();
        if (!token) {
            return {
                statusCode: 500,
                message: "Unable to retrieve Zoho access token.",
                data: null,
                success: false
            };
        }

        // 🔹 4. Build Zoho Task Payload
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

        // 🔹 5. Send request to Zoho CRM
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

module.exports = {
    userLoginService,
    getUserProfileService,
    editUserProfileService,
    acroReportService,
    blsAppointmentService,
}