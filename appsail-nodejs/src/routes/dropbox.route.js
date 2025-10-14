const express = require("express");
const User = require("../models/user.model");
const { getDropboxClient } = require("../configs/dropbox.config"); // ✅ import from your config

const router = express.Router();

// ✅ Dropbox webhook verification (GET)
router.get("/webhook", (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log("Dropbox webhook verified ✅");
    return res.status(200).send(challenge);
  }
  res.sendStatus(200);
});

// ✅ Dropbox event receiver (POST)
router.post("/webhook", async (req, res) => {
  try {
    console.log("📦 Dropbox Webhook Triggered");

    const { list_folder } = req.body;
    if (!list_folder || !list_folder.accounts) {
      console.log("⚠️ No accounts found in webhook payload");
      return res.sendStatus(200);
    }

    // Fetch updated files metadata for each Dropbox account triggered
    for (const accountId of list_folder.accounts) {
      await syncDropboxChanges(accountId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Dropbox webhook error:", error.message);
    res.sendStatus(500);
  }
});

// 🔹 This will use your auto-refresh Dropbox client
async function syncDropboxChanges(accountId) {
  try {
    console.log("🔄 Syncing Dropbox changes for account:", accountId);

    // ✅ get fresh, valid Dropbox client
    const dbx = await getDropboxClient();

    // ✅ call Dropbox API directly (no manual token needed)
    const response = await dbx.filesListFolder({ path: "" });

    const files = response.result.entries;

    for (const file of files) {
      if (file[".tag"] === "file") {
        console.log("📁 File added/modified:", file.name);

        // Example: match folder name or ID with user record
        const user = await User.findOne({
          dropBoxFolderId: file.parent_shared_folder_id,
        });

        if (user) {
          console.log(`📌 Updating files for user: ${user.fullName}`);

          // You can push the file metadata into user's document array, like:
          // await User.updateOne(
          //   { _id: user._id },
          //   { $push: { documents: fileMetadata } }
          // );

          // Or call your document sync logic here
        }
      }
    }
  } catch (err) {
    console.error("⚠️ Error syncing Dropbox:", err.message);
  }
}

module.exports = router;
