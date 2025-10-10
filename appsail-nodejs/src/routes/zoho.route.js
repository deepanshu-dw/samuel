const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// Endpoint Zoho will call
router.post("/zoho-webhook", async (req, res) => {
  try {
    console.log("Incoming Zoho data:", req.body);

    const {
      id, // Zoho unique user ID
      Full_Name, // Zoho full name field
      First_Name, // optional if you get separate fields
      Last_Name,
      Email,
      Phone,
      Nationality,
      Date_of_Birth,
      Gender,
      Passport_No,
      Visa_Refused,
      Status,
    } = req.body;

    // Map Zoho payload to your schema
    const updatedUser = await User.findOneAndUpdate(
      { zohoUserId: id },
      {
        firstName: First_Name || "",
        lastName: Last_Name || "",
        fullName: Full_Name || `${First_Name} ${Last_Name}`,
        email: Email || "",
        phone: Phone || "",
        nationality: Nationality || "",
        dateOfBirth: Date_of_Birth || "",
        gender: Gender || "",
        passportNo: Passport_No || "",
        visaRefused: Visa_Refused === "true" || false,
        status: Status || "Active",
      },
      { upsert: true, new: true } // insert if not exists, return updated doc
    );

    console.log("User synced:", updatedUser);

    res.json({ success: true, message: "User synced successfully" });
  } catch (error) {
    console.error("Error syncing user:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
