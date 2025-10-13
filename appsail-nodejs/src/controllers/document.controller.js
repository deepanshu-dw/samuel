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

const documentStatus = async (req, res) => {
    try {
        const result = await documentService.documentStatusService(req);

        return res.status(result.success ? 200 : 400).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Get Document Status Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
};

const documentByType = async (req, res) => {
    try {
        const result = await documentService.documentByTypeService(req);

        return res.status(result.success ? 200 : 400).json({
            message: result.message,
            data: result.data,
            success: result.success,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Get Document By Type Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            timestamp: new Date().toISOString(),
        });
    }
};

module.exports = { uploadFile, documentStatus, documentByType };
