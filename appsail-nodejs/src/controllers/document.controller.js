const documentService = require("../services/document.service.js");

const uploadFile = async (req, res) => {
    try {
        const result = await documentService.uploadFileService(req);

        return res.status(result.success ? 200 : 400).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Upload File Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
};

module.exports = { uploadFile };
