const express = require("express");
require("dotenv").config();

const mongoConnection = require("./src/configs/mongo.config.js");
const userRoutes = require("./src/routes/user.route.js");
const zohoRoutes = require("./src/routes/zoho.route.js");
const chatRoutes = require("./src/routes/chat.route.js");
const documentRoutes = require("./src/routes/document.route.js");
const dropboxRoutes = require("./src/routes/dropbox.route.js");

const app = express();
// const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 9000;


app.use(express.json());
// console.log("✅ userRoutes:", userRoutes);
// console.log("✅ zohoRoutes:", zohoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/zoho", zohoRoutes);
// app.use("/api/chat", chatRoutes);
app.use("/api/dropbox", dropboxRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  await mongoConnection();
  console.log(`✅ Server is listening on port ${port}`);
  // console.log(`http://localhost:${port}/`);
});

// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const fs = require("fs");

// const app = express();
// app.use(express.json());

// const {
//   X_ZOHO_CATALYST_LISTEN_PORT,
//   ZOHO_CLIENT_ID,
//   ZOHO_CLIENT_SECRET,
//   ZOHO_REDIRECT_URI,
//   ZOHO_ACCOUNTS_URL,
// } = process.env;

// // ======================================================
// // 🔹 Step 1: Redirect user to Zoho consent page
// // ======================================================
// app.get("/auth", (req, res) => {
//   const scope = [
//     "ZohoCRM.modules.ALL",
//     "ZohoCRM.settings.ALL",
//     "ZohoCRM.users.ALL",
//     "ZohoCRM.org.ALL",
//   ].join(",");

//   const authURL = `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?scope=${scope}&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${ZOHO_REDIRECT_URI}`;

//   console.log("Redirecting to:", authURL);
//   res.redirect(authURL);
// });

// // ======================================================
// // 🔹 Step 2: Handle Zoho callback and save tokens
// // ======================================================
// app.get("/auth/callback", async (req, res) => {
//   const { code } = req.query;
//   if (!code) return res.status(400).send("Missing 'code' from Zoho callback");

//   try {
//     const tokenURL = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;

//     const response = await axios.post(tokenURL, null, {
//       params: {
//         code,
//         client_id: ZOHO_CLIENT_ID,
//         client_secret: ZOHO_CLIENT_SECRET,
//         redirect_uri: ZOHO_REDIRECT_URI,
//         grant_type: "authorization_code",
//       },
//     });

//     const { access_token, refresh_token, expires_in, api_domain } = response.data;

//     // Store data in token.json
//     const tokenData = {
//       access_token,
//       refresh_token,
//       expires_in,
//       api_domain,
//       modules: [
//         "ZohoCRM.modules.ALL",
//         "ZohoCRM.settings.ALL",
//         "ZohoCRM.users.ALL",
//         "ZohoCRM.org.ALL",
//       ],
//       generated_at: new Date().toISOString(),
//       expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
//     };

//     fs.writeFileSync("token.json", JSON.stringify(tokenData, null, 2));
//     console.log("✅ Token stored successfully in token.json");

//     res.send(
//       `<h2>✅ Authorization successful!</h2><p>Token saved in <code>token.json</code>.</p>`
//     );
//   } catch (err) {
//     console.error("Error exchanging code for tokens:", err.response?.data || err.message);
//     res.status(500).json({
//       error: "Failed to generate access token",
//       details: err.response?.data || err.message,
//     });
//   }
// });

// // ======================================================
// // 🔹 Step 3: Refresh token route (optional)
// // ======================================================
// app.get("/auth/refresh", async (req, res) => {
//   try {
//     if (!fs.existsSync("token.json"))
//       return res.status(400).json({ error: "token.json not found" });

//     const tokenData = JSON.parse(fs.readFileSync("token.json"));
//     const { refresh_token } = tokenData;

//     const tokenURL = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;

//     const response = await axios.post(tokenURL, null, {
//       params: {
//         refresh_token,
//         client_id: ZOHO_CLIENT_ID,
//         client_secret: ZOHO_CLIENT_SECRET,
//         grant_type: "refresh_token",
//       },
//     });

//     const { access_token, expires_in } = response.data;
//     tokenData.access_token = access_token;
//     tokenData.expires_in = expires_in;
//     tokenData.expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

//     fs.writeFileSync("token.json", JSON.stringify(tokenData, null, 2));
//     console.log("🔄 Access token refreshed successfully!");

//     res.json({
//       message: "Access token refreshed successfully!",
//       data: tokenData,
//     });
//   } catch (err) {
//     console.error("Error refreshing token:", err.response?.data || err.message);
//     res.status(500).json({
//       error: "Failed to refresh token",
//       details: err.response?.data || err.message,
//     });
//   }
// });

// // ======================================================
// // 🔹 Step 4: Run server
// // ======================================================
// app.listen(X_ZOHO_CATALYST_LISTEN_PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${X_ZOHO_CATALYST_LISTEN_PORT}`);
//   console.log(`➡️  Visit http://localhost:${X_ZOHO_CATALYST_LISTEN_PORT}/auth to start Zoho OAuth flow`);
// });
