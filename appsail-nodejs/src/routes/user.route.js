const express = require('express');
const userController = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/login", userController.userLogin);

router.get("/profile/:id", userController.getUserProfile);

router.put("/edit/:id", userController.editUserProfile);


module.exports = router;
