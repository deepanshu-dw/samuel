const { Dropbox } = require("dropbox");
const userModel = require("../models/user.model.js");
const documentModel = require("../models/document.model.js");
const { getDropboxClient } = require("../configs/dropbox.config.js");

// const dbx = new Dropbox({ accessToken: process.env.DROPBOX_REFRESH_TOKEN });


/**
 * Handles file upload to Dropbox
 * @param {Object} file - req.file
 * @param {string} userId - user id from params
 */
const uploadFileService = async (req) => {
    try {
        // Destructure inputs
        const { userId } = req.params;
        const { file } = req;
        const { type } = req.body;

        // Step 0: Validate inputs
        if (!file) return { success: false, message: "No file uploaded.", data: null };
        if (!userId) return { success: false, message: "User ID is required.", data: null };
        if (!type) return { success: false, message: "Document type is required.", data: null };

        // Step 1: Check if user exists and is active
        const user = await userModel.findOne({ _id: userId, active: true });
        if (!user) return { success: false, message: "User not found or inactive.", data: null };
        if (!user.dropBoxFolderId) return { success: false, message: "User has no Dropbox folder ID.", data: null };

        // Step 2: Initialize Dropbox client
        const dbx = await getDropboxClient();

        // Step 3: Validate Dropbox folder
        const folderMetadata = await dbx.filesGetMetadata({ path: user.dropBoxFolderId });
        if (!folderMetadata || !folderMetadata?.result?.id) {
            return { success: false, message: "Dropbox folder invalid. Contact admin.", data: null };
        }

        // Step 4: Upload file to Dropbox
        const { buffer, originalname } = file;
        const dropboxPath = `${user.dropBoxFolderId}/${type.toLowerCase()}/${originalname}`;
        const uploadResponse = await dbx.filesUpload({
            path: dropboxPath,
            contents: buffer,
            mode: "add", // 'add' = create new, 'overwrite' = replace if exists
        });

        // Step 5: Create shared link
        const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: uploadResponse.result.path_lower,
        });

        // Step 6: Prepare file info object for DB
        const fileData = {
            dropboxPath: uploadResponse.result.path_lower,
            fileUrl: sharedLinkResponse.result.url.replace("?dl=0", "?dl=1"),
            fileId: uploadResponse.result.id,
            uploadedBy: "user",
            uploadedAt: new Date(),
        };

        // Step 7: Update document model
        const updateQuery = {};
        updateQuery[type] = fileData; // dynamic field based on type

        await documentModel.findOneAndUpdate(
            { userId },
            { $push: updateQuery },
            { upsert: true, new: true }
        );

        return {
            success: true,
            message: "File uploaded successfully.",
            data: fileData,
        };
    } catch (error) {
        console.error("Dropbox Upload Error:", error);
        return { success: false, message: error?.error?.error_summary || "File upload failed.", data: null };
    }
};

const getDocument = async (req) => {
    //get document from here.
}

module.exports = { uploadFileService };
