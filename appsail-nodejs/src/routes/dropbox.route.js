const express = require("express");
const router = express.Router();
const { getDropboxClient } = require("../configs/dropbox.config");
const { getAccessToken } = require("../configs/zoho.config");
const User = require("../models/user.model");
const axios = require("axios");

/**
 * ✅ Sync Dropbox Folder ID from Zoho to MongoDB
 * Called when Dropbox webhook fires, to ensure folder IDs stay current
 */
async function syncDropboxFolderIdFromZoho(contactId) {
  try {
    const token = await getAccessToken();

    // Fetch user details from Zoho
    const { data: zohoRes } = await axios.get(
      `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
      {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      }
    );

    const contact = zohoRes.data[0];

    if (!contact) {
      console.log("⚠️ Contact not found in Zoho.");
      return;
    }

    const dropboxFolderId = contact.dropboxextension__Dropbox_Folder_ID || "";

    console.log(
      `🔄 Syncing Dropbox Folder ID for ${contact.Full_Name}: ${dropboxFolderId}`
    );

    // 🔄 Update MongoDB with new folder ID
    await User.findOneAndUpdate(
      { zohoUserId: contact.id },
      { dropBoxFolderId: dropboxFolderId }
      //   { upsert: fa, new: true }
    );

    console.log(`✅ Synced Dropbox Folder ID for ${contact.Full_Name}`);
  } catch (err) {
    console.error("❌ Failed to sync Dropbox folder ID:", err.message);
  }
}

/**
 * ✅ Dropbox webhook verification (GET)
 */
router.get("/webhook", (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log("🔹 Dropbox webhook verified successfully");
    return res.status(200).send(challenge);
  }
  res.status(400).send("Missing challenge");
});

/**
 * ✅ Dropbox webhook event listener (POST)
 * Triggered whenever a Dropbox change occurs
 */
router.post("/webhook", async (req, res) => {
  try {
    const { list_folder } = req.body;

    console.log("📦 Dropbox Webhook Triggered");

    if (!list_folder || !list_folder.accounts) {
      console.log("⚠️ No accounts found in webhook payload");
      return res.sendStatus(200);
    }

    const dbx = await getDropboxClient();

    // Loop through Dropbox accounts that have changes
    for (const accountId of list_folder.accounts) {
      console.log(`🔍 Checking Dropbox changes for account: ${accountId}`);

      // Find users with valid Dropbox folder IDs
      const users = await User.find({
        dropBoxFolderId: { $exists: true, $ne: "" },
      });

      // Loop through all users that have Dropbox folders
      for (const user of users) {
        try {
          // Fetch files inside the user’s Dropbox folder
          const files = await dbx.filesListFolder({
            path: user.dropBoxFolderId,
            recursive: false,
          });

          console.log(
            `📁 Found ${files.entries.length} files for ${
              user.email || user.fullName
            }`
          );

          // TODO: Store or update these files in DB
          // e.g. File collection to track uploaded documents
        } catch (err) {
          if (err.status === 409) {
            console.log(`❌ Folder not found for ${user.email}`);
          } else {
            console.error("Dropbox API error:", err);
          }
        }
      }
    }

    // ✅ Sync Dropbox Folder ID from Zoho after Dropbox webhook fires
    try {
      // You can loop through all Zoho contacts if needed,
      // or trigger it for a specific one if you pass contactId.
      const users = await User.find({}, "zohoUserId");
      for (const u of users) {
        await syncDropboxFolderIdFromZoho(u.zohoUserId);
      }
    } catch (err) {
      console.error("⚠️ Failed to sync Zoho folder IDs:", err.message);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Dropbox webhook handler error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
