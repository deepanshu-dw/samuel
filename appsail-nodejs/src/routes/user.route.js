const express = require('express');
const userController = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/login", userController.userLogin);

router.get("/profile/:id", userController.getUserProfile);

module.exports = router;
