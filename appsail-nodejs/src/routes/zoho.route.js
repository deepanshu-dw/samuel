const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// ZOHO → DB Webhook Sync
router.post("/zoho-webhook", async (req, res) => {
  try {
    console.log("📩 Incoming Zoho webhook payload:", req.body);

    // Ensure payload structure matches Zoho's webhook schema
    const {
      id, // Zoho Contact ID
      Full_Name,
      First_Name,
      Last_Name,
      Email,
      Phone,
      Nationality,
      Date_of_Birth,
      Gender,
      Passport_No,
      Visa_Refused,
      Status,
      Modified_Time, // optional, but useful
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Zoho user ID (id)" });
    }

    // ✅ Check if user exists in DB by zohoUserId
    const existingUser = await User.findOne({ zohoUserId: id });

    if (!existingUser) {
      console.log(
        "❌ No matching user found in local DB, ignoring new Zoho record."
      );
      return res.status(200).json({
        success: true,
        message: "Ignored - no matching Zoho user found in DB.",
      });
    }

    // ✅ Only update if user exists
    const updatedUser = await User.findOneAndUpdate(
      { zohoUserId: id },
      {
        $set: {
          firstName: First_Name || existingUser.firstName,
          lastName: Last_Name || existingUser.lastName,
          fullName:
            Full_Name || `${First_Name || ""} ${Last_Name || ""}`.trim(),
          email: Email || existingUser.email,
          phone: Phone || existingUser.phone,
          nationality: Nationality || existingUser.nationality,
          dateOfBirth: Date_of_Birth || existingUser.dateOfBirth,
          gender: Gender || existingUser.gender,
          passportNo: Passport_No || existingUser.passportNo,
          visaRefused: Visa_Refused === "true" || existingUser.visaRefused,
          status: Status || existingUser.status,
          lastSyncedAt: new Date(),
        },
      },
      { new: true } // do NOT use upsert here
    );

    console.log(
      "✅ Existing user updated via Zoho webhook:",
      updatedUser.email
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully via Zoho webhook.",
      updatedUser,
    });
  } catch (error) {
    console.error("❌ Error syncing user from Zoho:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during Zoho sync.",
      error: error.message,
    });
  }
});

module.exports = router;
