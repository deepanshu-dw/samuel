// const Chat = require("../models/chat.model.js");
// const { generateAnswer } = require("../services/openai.service.js");
// const { getCRMData } = require("../services/zoho-crm.service.js");

// const chatWithBot = async (req, res) => {
//   try {
//     const { query, userId } = req.body;

//     if (!query || !userId) {
//       return res.status(400).json({ error: "query and userId are required" });
//     }

//     // 1. Fetch CRM Data (example: Contacts)
//     let crmData = {};
//     try {
//       crmData = await getCRMData("Contacts", { per_page: 1 });
//     } catch (e) {
//       console.warn("⚠️ Could not fetch CRM data, continuing...");
//     }

//     // 2. Generate AI Answer
//     const answer = await generateAnswer(
//       `User asked: ${query}. CRM Data: ${JSON.stringify(crmData)}`
//     );

//     // 3. Save to DB
//     const chat = await Chat.create({
//       userId,
//       query,
//       answer,
//       crmData,
//     });

//     res.status(201).json({ success: true, data: chat });
//   } catch (err) {
//     console.error("❌ Chat API error:", err.message);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// module.exports = { chatWithBot };
