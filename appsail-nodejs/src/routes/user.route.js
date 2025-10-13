const express = require('express');
const userController = require("../controllers/user.controller.js");
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.post("/login", userController.userLogin);

router.post("/verify-otp", userController.verifyOtp);

router.get("/profile", authMiddleware, userController.getUserProfile);

router.put("/edit/profile", authMiddleware, userController.editUserProfile);

// router.post("/acro/complete", userController.acroReport)

router.post("/bls/appointment", authMiddleware, userController.blsAppointment);

router.get("/dashboard/progress", authMiddleware, userController.dashboardProgressTracker);

router.get("/notification", authMiddleware, userController.getAllNotifications)

module.exports = router;
