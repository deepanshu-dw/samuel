// const express = require("express");
// const router = express.Router();
// const upload = require("../configs/multer.config.js");
// const { uploadDocument, uploadFile } = require("../controllers/document.controller.js");

// router.post("/upload", upload.single("document"), uploadDocument);
// router.post("/upload/:userId", upload.single("document"), uploadFile);

// module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../configs/multer.config.js");
const documentController = require("../controllers/document.controller.js");

// Single route for file upload
router.post("/upload/:userId", upload.single("document"), documentController.uploadFile);
router.get("/status/:userId", documentController.documentStatus);
router.get("/type/:userId/:type", documentController.documentByType);

module.exports = router;
