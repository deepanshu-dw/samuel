const axios = require("axios");
const userModel = require("../models/user.model.js");
const documentModel = require("../models/document.model.js");
const { uploadToDropbox } = require("../configs/dropbox.config.js");
const notificationModel = require("../models/notification.model.js");
const { getAccessToken } = require("../configs/zoho.config.js");


/**
 * Handles file upload to Dropbox
 * @param {Object} file - req.file
 * @param {string} userId - user id from params
 */

// const uploadFileService = async (req) => {
//     try {
//         const { userId } = req.user;
//         const { file } = req;
//         const { type } = req.body;

//         if (!file) return { success: false, message: "No file uploaded.", data: null };
//         if (!userId) return { success: false, message: "User ID is required.", data: null };
//         if (!type) return { success: false, message: "Document type is required.", data: null };

//         // 🧠 Step 1: Validate type
//         const validTypes = [
//             "passport",
//             "proof_of_accomodation",
//             "proof_of_identity",
//             "passport_size_photo",
//             "bank_statement",
//             "health_insurance",
//             "criminal_record",
//             "employment_letter",
//             "travel_itinerary",
//         ];

//         const normalizedType = type?.toLowerCase();

//         if (!validTypes.includes(normalizedType)) {
//             return { success: false, message: "Invalid document type.", data: null };
//         }

//         // Step 2: Check if user exists and active
//         const user = await userModel.findOne({ _id: userId, active: true });
//         if (!user) return { success: false, message: "User not found or inactive.", data: null };
//         if (!user.dropBoxFolderId)
//             return { success: false, message: "User has no Dropbox folder ID.", data: null };

//         // Step 3: Upload to Dropbox
//         const fileData = null;//await uploadToDropbox(user.dropBoxFolderId, normalizedType, file);

//         // Step 4: Save to DB dynamically
//         const updateQuery = {};
//         updateQuery[normalizedType] = fileData;

//         await documentModel.findOneAndUpdate(
//             { userId },
//             { $push: updateQuery },
//             { upsert: true, new: true }
//         );
//         // 🧩 Step 4: Update Zoho CRM
//         if (user.zohoUserId) {
//             try {
//                 const token = await getAccessToken();
//                 const contactId = user.zohoUserId;

//                 // Fetch existing contact data
//                 const { data: zohoRes } = await axios.get(
//                     `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
//                     {
//                         headers: { Authorization: `Zoho-oauthtoken ${token}` },
//                     }
//                 );

//                 const contact = zohoRes.data[0];
//                 console.log(contact)
//                 let applicationDocuments = contact.Application_Documents || [];
//                 let supportingDocs = contact.Other_Residency_Info || "";

//                 // Map of Application_Documents types
//                 const applicationDocMap = {
//                     criminal_record: "Criminal Record Check",
//                     proof_of_accomodation: "Proof of Address (Rental)",
//                     health_insurance: "Private Medical Insurance Policy Certificate",
//                     bank_statement: "Bank Statements (last 12 months)",
//                     proof_of_identity: "Health Certificate/s UK",
//                 };

//                 let updateNeeded = false;
//                 let updatePayload = {};

//                 if (applicationDocMap[normalizedType]) {
//                     // This document belongs to Application_Documents
//                     const docLabel = applicationDocMap[normalizedType];
//                     if (!applicationDocuments.includes(docLabel)) {
//                         applicationDocuments.push(docLabel);
//                         updatePayload.Application_Documents = applicationDocuments;
//                         updateNeeded = true;
//                     }
//                 } else {
//                     // All others go to Other_Residency_Info (as a comma-separated string)
//                     if (!supportingDocs.toLowerCase().includes(normalizedType)) {
//                         supportingDocs = supportingDocs
//                             ? `${supportingDocs}, ${normalizedType}`
//                             : normalizedType;
//                         updatePayload.Other_Residency_Info = supportingDocs;
//                         updateNeeded = true;
//                     }
//                 }
//                 // return {
//                 //     statusCode: 200,
//                 //     message: "Police ACRO report marked as completed successfully.",
//                 //     data: { userId: applicationDocuments, status: supportingDocs, applicationDocMap, updateNeeded, updatePayload },
//                 //     success: true
//                 // };
//                 if (updateNeeded) {
//                     await axios.put(
//                         `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
//                         { data: [updatePayload] },
//                         {
//                             headers: {
//                                 Authorization: `Zoho-oauthtoken ${token}`,
//                                 "Content-Type": "application/json",
//                             },
//                         }
//                     );
//                     console.log(`✅ Zoho CRM updated for ${normalizedType}`);
//                 } else {
//                     console.log(`ℹ️ No Zoho update needed for ${normalizedType}`);
//                 }
//             } catch (zohoErr) {
//                 console.error(
//                     "⚠️ Zoho update failed:",
//                     zohoErr.response?.data || zohoErr.message
//                 );
//             }
//         }

//         await notificationModel.create({
//             userId,
//             title: "Document uploaded successfully.",
//             message: "Your document has beed collected successfully and admin will verify and update you soon."
//         });
//         //write notify code here.

//         return {
//             success: true,
//             message: `Document uploaded successfully.`,
//             data: fileData,
//         };
//     } catch (error) {
//         console.error("Dropbox Upload Error:", error);
//         return {
//             success: false,
//             message: error?.error?.error_summary || "File upload failed.",
//             data: null,
//         };
//     }
// };

const uploadFileService = async (req) => {
    try {
        const { userId } = req.user;
        const { file } = req;
        const { type } = req.body;

        if (!file) return { success: false, message: "No file uploaded.", data: null };
        if (!userId) return { success: false, message: "User ID is required.", data: null };
        if (!type) return { success: false, message: "Document type is required.", data: null };

        const validTypes = [
            "passport",
            "proof_of_accomodation",
            "proof_of_identity",
            "passport_size_photo",
            "bank_statement",
            "health_insurance",
            "criminal_record",
            "employment_letter",
            "travel_itinerary",
            "health_certificate"
        ];

        const normalizedType = type?.toLowerCase();
        if (!validTypes.includes(normalizedType)) {
            return { success: false, message: "Invalid document type.", data: null };
        }

        // Step 1️⃣: Find active user
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) return { success: false, message: "User not found or inactive.", data: null };
        if (!user.dropBoxFolderId)
            return { success: false, message: "User has no Dropbox folder ID.", data: null };

        // Step 2️⃣: Upload to Dropbox
        const fileData = await uploadToDropbox(user.dropBoxFolderId, normalizedType, file);

        // Step 3️⃣: Save to MongoDB
        const updateQuery = {};
        updateQuery[normalizedType] = fileData;
        await documentModel.findOneAndUpdate(
            { userId },
            { $push: updateQuery },
            { upsert: true, new: true }
        );

        // Step 4️⃣: Sync with Zoho CRM (only if Zoho Contact ID exists)
        if (user.zohoUserId) {
            try {
                const token = await getAccessToken();
                const contactId = user.zohoUserId;

                // Fetch existing contact
                const { data: zohoRes } = await axios.get(
                    `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
                    {
                        headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    }
                );

                const contact = zohoRes.data[0];
                let applicationDocuments = contact.Application_Documents || [];
                let otherResidencyInfo = contact.Other_Residency_Info || "";

                // Map of Application_Documents types
                const applicationDocMap = {
                    criminal_record: "Criminal Record Check",
                    proof_of_accomodation: "Proof of Address (Rental)",
                    health_insurance: "Private Medical Insurance Policy Certificate",
                    bank_statement: "Bank Statements (last 12 months)",
                    health_certificate: "Health Certificate/s UK",
                };

                let updateNeeded = false;
                let updatePayload = {};

                if (applicationDocMap[normalizedType]) {
                    // Belongs to Application_Documents
                    const docLabel = applicationDocMap[normalizedType];
                    if (!applicationDocuments.includes(docLabel)) {
                        applicationDocuments.push(docLabel);
                        updatePayload.Application_Documents = applicationDocuments;
                        updateNeeded = true;
                    }
                } else {
                    // 🧩 Belongs to Other_Residency_Info
                    const typeName = type
                        .split("_")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                    const existingItems = otherResidencyInfo
                        .split(",")
                        .map(item => item.trim().toLowerCase())
                        .filter(Boolean);

                    if (!existingItems.includes(typeName.toLowerCase())) {
                        const updatedList = otherResidencyInfo
                            ? `${otherResidencyInfo}, ${typeName}`
                            : typeName;
                        updatePayload.Other_Residency_Info = updatedList;
                        updateNeeded = true;
                    }
                }

                if (updateNeeded) {
                    await axios.put(
                        `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
                        { data: [updatePayload] },
                        {
                            headers: {
                                Authorization: `Zoho-oauthtoken ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    console.log(`✅ Zoho CRM updated for ${type}`);
                } else {
                    console.log(`ℹ️ No Zoho update needed for ${type}`);
                }
            } catch (zohoErr) {
                console.error(
                    "⚠️ Zoho update failed:",
                    zohoErr.response?.data || zohoErr.message
                );
            }
        }

        // Step 5️⃣: Notify user
        await notificationModel.create({
            userId,
            title: "Document uploaded successfully.",
            message:
                "Your document has been collected successfully. Admin will verify and update you soon.",
        });

        return {
            success: true,
            message: "Document uploaded successfully.",
            data: fileData,
        };
    } catch (error) {
        console.error("Dropbox Upload Error:", error);
        return {
            success: false,
            message: error?.error?.error_summary || "File upload failed.",
            data: null,
        };
    }
};

const documentStatusService = async (req) => {
    try {
        const { userId } = req.user;

        if (!userId) {
            return {
                statusCode: 400,
                message: "User ID is required.",
                data: null,
                success: false,
            };
        }

        // 🔹 1. Find document record
        const userDocs = await documentModel.findOne({ userId });
        if (!userDocs) {
            return {
                statusCode: 404,
                message: "No document record found for this user.",
                data: null,
                success: false,
            };
        }

        // 🔹 2. Define document fields (same as in your schema)
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
        ];

        // 🔹 3. Build status result
        const statusResult = {};
        for (const field of docFields) {
            const files = userDocs[field] || [];
            statusResult[field] = files.length > 0 ? "uploaded" : "pending";
        }

        return {
            statusCode: 200,
            message: "Document status fetched successfully.",
            data: statusResult,
            success: true,
        };

    } catch (error) {
        console.error("🔥 getDocumentStatus Error:", error);
        return {
            statusCode: 500,
            message: "Failed to fetch document status.",
            data: null,
            success: false,
        };
    }
};

const documentByTypeService = async (req) => {
    try {
        const { type } = req.params;
        const { userId } = req.user;

        if (!userId) {
            return { success: false, message: "A valid 'userId' is required.", data: null };
        }

        if (!type || typeof type !== "string") {
            return { success: false, message: "Document 'type' is required.", data: null };
        }

        // List of valid types (snake_case)
        const validTypes = [
            "passport",
            "proof_of_accomodation",
            "proof_of_identity",
            "passport_size_photo",
            "bank_statement",
            "health_insurance",
            "criminal_record",
            "employment_letter",
            "travel_itinerary",
        ];

        if (!validTypes.includes(type.toLowerCase())) {
            return { success: false, message: "Invalid document type.", data: null };
        }

        // Fetch user document
        const userDocs = await documentModel.findOne({ userId });
        if (!userDocs) {
            return { success: false, message: "No document record found for this user.", data: null };
        }

        const documentsArray = userDocs[type] || [];

        return {
            success: true,
            message: `Documents fetched for '${type}'.`,
            data: documentsArray,
        };

    } catch (error) {
        console.error("🔥 getDocumentByTypeService Error:", error);
        return { success: false, message: "Failed to fetch documents.", data: null };
    }
};

module.exports = { uploadFileService, documentStatusService, documentByTypeService };
