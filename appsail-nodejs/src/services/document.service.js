const { Dropbox } = require("dropbox");
const userModel = require("../models/user.model.js");
const documentModel = require("../models/document.model.js");
const { uploadToDropbox } = require("../configs/dropbox.config.js");

// const dbx = new Dropbox({ accessToken: process.env.DROPBOX_REFRESH_TOKEN });


/**
 * Handles file upload to Dropbox
 * @param {Object} file - req.file
 * @param {string} userId - user id from params
 */
// const uploadFileService = async (req) => {
//     try {
//         // Destructure inputs
//         const { userId } = req.params;
//         const { file } = req;
//         const { type } = req.body;

//         // Step 0: Validate inputs
//         if (!file) return { success: false, message: "No file uploaded.", data: null };
//         if (!userId) return { success: false, message: "User ID is required.", data: null };
//         if (!type) return { success: false, message: "Document type is required.", data: null };

//         // Step 1: Check if user exists and is active
//         const user = await userModel.findOne({ _id: userId, active: true });
//         if (!user) return { success: false, message: "User not found or inactive.", data: null };
//         if (!user.dropBoxFolderId) return { success: false, message: "User has no Dropbox folder ID.", data: null };

//         // Step 2: Initialize Dropbox client
//         const dbx = await getDropboxClient();

//         // Step 3: Validate Dropbox folder
//         const folderMetadata = await dbx.filesGetMetadata({ path: user.dropBoxFolderId });
//         if (!folderMetadata || !folderMetadata?.result?.id) {
//             return { success: false, message: "Dropbox folder invalid. Contact admin.", data: null };
//         }

//         // Step 4: Upload file to Dropbox
//         const { buffer, originalname } = file;
//         const dropboxPath = `${user.dropBoxFolderId}/${type.toLowerCase()}/${originalname}`;
//         const uploadResponse = await dbx.filesUpload({
//             path: dropboxPath,
//             contents: buffer,
//             mode: "add", // 'add' = create new, 'overwrite' = replace if exists
//         });

//         // Step 5: Create shared link
//         const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
//             path: uploadResponse.result.path_lower,
//         });

//         // Step 6: Prepare file info object for DB
//         const fileData = {
//             dropboxPath: uploadResponse.result.path_lower,
//             fileUrl: sharedLinkResponse.result.url.replace("?dl=0", "?dl=1"),
//             fileId: uploadResponse.result.id,
//             uploadedBy: "user",
//             uploadedAt: new Date(),
//         };

//         // Step 7: Update document model
//         const updateQuery = {};
//         updateQuery[type] = fileData; // dynamic field based on type

//         await documentModel.findOneAndUpdate(
//             { userId },
//             { $push: updateQuery },
//             { upsert: true, new: true }
//         );

//         return {
//             success: true,
//             message: "File uploaded successfully.",
//             data: fileData,
//         };
//     } catch (error) {
//         console.error("Dropbox Upload Error:", error);
//         return { success: false, message: error?.error?.error_summary || "File upload failed.", data: null };
//     }
// };

const uploadFileService = async (req) => {
    try {
        const { userId } = req.params;
        const { file } = req;
        const { type } = req.body;

        if (!file) return { success: false, message: "No file uploaded.", data: null };
        if (!userId) return { success: false, message: "User ID is required.", data: null };
        if (!type) return { success: false, message: "Document type is required.", data: null };

        // 🧠 Step 1: Validate type
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

        const normalizedType = type?.toLowerCase();

        if (!validTypes.includes(normalizedType)) {
            return { success: false, message: "Invalid document type.", data: null };
        }

        // Step 2: Check if user exists and active
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) return { success: false, message: "User not found or inactive.", data: null };
        if (!user.dropBoxFolderId)
            return { success: false, message: "User has no Dropbox folder ID.", data: null };

        // Step 3: Upload to Dropbox
        const fileData = await uploadToDropbox(user.dropBoxFolderId, normalizedType, file);

        // Step 4: Save to DB dynamically
        const updateQuery = {};
        updateQuery[normalizedType] = fileData;

        await documentModel.findOneAndUpdate(
            { userId },
            { $push: updateQuery },
            { upsert: true, new: true }
        );

        return {
            success: true,
            message: `Document uploaded successfully.`,
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
        const { userId } = req.params;

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
        const { userId, type } = req.params;

        if (!userId || typeof userId !== "string") {
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
