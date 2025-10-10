const express = require('express');
const userController = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/login", userController.userLogin);

router.post("/verify-otp", userController.verifyOtp);

router.get("/profile/:id", userController.getUserProfile);

router.put("/edit/:id", userController.editUserProfile);

// router.post("/acro/complete", userController.acroReport)

router.post("/bls/appointment", userController.blsAppointment);

router.get("/dashboard/progress/:userId", userController.dashboardProgressTracker);


module.exports = router;
