const multer = require("multer");

// Memory storage — stores files in memory as Buffer
const storage = multer.memoryStorage();

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  // optional: file filter if you want to restrict file types
  // fileFilter: (req, file, cb) => {
  //   const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  //   if (allowedTypes.includes(file.mimetype)) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Unsupported file type"), false);
  //   }
  // }
});

module.exports = upload;
