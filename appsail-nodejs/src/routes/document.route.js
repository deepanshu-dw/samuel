const express = require("express");
const router = express.Router();
const upload = require("../configs/multer.config.js");
const documentController = require("../controllers/document.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

// Single route for file upload
router.post("/upload", upload.single("document"), authMiddleware, documentController.uploadFile);

router.get("/status", authMiddleware, documentController.documentStatus);

router.get("/type/:type", authMiddleware, documentController.documentByType);

module.exports = router;
