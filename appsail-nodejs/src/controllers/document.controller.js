// //controller for handling documents upload n all

// const userModel = require("../models/user.model.js");
// const { uploadDocumentService } = require("../services/document.service.js");

// const uploadDocument = async (req, res) => {
//     try {
//         const result = await uploadDocumentService(req.file);
//         const statusCode = result.success ? 200 : 400;
//         res.status(statusCode).json(result);
//     } catch (error) {
//         console.error("Upload error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error.",
//             data: null,
//         });
//     }
// };

// const { uploadDocuments } = require('../services/document.service.js');

// // Mock function to get user info (replace with DB or Zoho API)
// // async function getUserInfo(userId) {
// //     // Example response
// //     return {
// //         fullName: 'Mr. Deepanshu Tyagi',
// //         zohoUserId: '1234567890'
// //     };
// // }

// const uploadFile = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded', success: false });
//         }

//         // Fetch user info
//         const user = await userModel.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found', success: false });

//         const { buffer, originalname } = req.file;

//         // Upload file to Dropbox
//         const dropboxData = await uploadDocuments(buffer, originalname, user.fullName, user.zohoUserId, 'realuploadeddoc');

//         res.status(200).json({
//             message: 'File uploaded successfully',
//             // data: dropboxData,
//             data: { originalname },
//             success: true
//         });
//     } catch (err) {
//         console.error("ye wala:", err);
//         res.status(500).json({ message: 'Upload failed', success: false, error: err.message });
//     }
// };

// module.exports = { uploadDocument, uploadFile };