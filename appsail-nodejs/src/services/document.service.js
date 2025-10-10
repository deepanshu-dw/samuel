// //document service
// const path = require("path");

// const uploadDocumentService = async (file) => {
//     if (!file) {
//         return {
//             success: false,
//             message: "No file uploaded.",
//             data: null,
//         };
//     }

//     // You can later store this info in Zoho CRM or a database
//     const fileInfo = {
//         originalName: file.originalname,
//         fileName: file.filename,
//         filePath: path.join("uploads", file.filename),
//         mimeType: file.mimetype,
//         size: file.size,
//     };

//     return {
//         success: true,
//         message: "File uploaded successfully.",
//         data: fileInfo,
//     };
// };

// const { Dropbox } = require('dropbox');
// /**
//  * Uploads file to Dropbox under app-demo/fullName(zohoUserId)/folder
//  * @param {Buffer} fileBuffer - file data
//  * @param {string} fileName - file name with extension
//  * @param {string} fullName - user's full name
//  * @param {string} zohoUserId - Zoho CRM userId
//  * @param {string} uploadedFolder - subfolder name (like "realuploadeddoc")
//  */
// const uploadDocuments = async (fileBuffer, fileName, fullName, zohoUserId, uploadedFolder = 'realuploadeddoc') => {
//     try {
//         const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

//         const files = await dbx.filesListFolder({ path: "" });
//         console.log("files: ", files.result.entries)
//         const dropboxPath = `/App Testing/${fullName}(${zohoUserId})/${fileName}`;

//         console.log("dropboxPath: ", dropboxPath);
//         // Upload file to Dropbox
//         // return {
//         //     dropboxPath: "qwer",// response.result.path_display,
//         //     url: "qw",// sharedLink.result.url.replace('?dl=0', '?dl=1')
//         // };
//         const response = await dbx.filesUpload({
//             path: dropboxPath,
//             contents: fileBuffer,
//             // mode: { '.tag': 'overwrite' } // overwrite if exists
//         });
//         console.log("response: ", response)
//         // Generate shared link
//         const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
//             path: response.result.path_lower
//         });
//         console.log("sharedLink: ", sharedLink)
//         return {
//             dropboxPath: response.result.path_display,
//             url: sharedLink.result.url.replace('?dl=0', '?dl=1')
//         };
//     } catch (error) {
//         throw new Error(error);
//     }
// };


// module.exports = { uploadDocumentService, uploadDocuments };
