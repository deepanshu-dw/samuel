const express = require("express");
require("dotenv").config();

const mongoConnection = require("./src/configs/mongo.config.js");
const userRoutes = require("./src/routes/user.route.js");
const zohoRoutes = require("./src/routes/zoho.route.js");
const chatRoutes = require("./src/routes/chat.route.js");

const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

app.use(express.json());
console.log("✅ userRoutes:", userRoutes);
console.log("✅ zohoRoutes:", zohoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/zoho", zohoRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  await mongoConnection();
  console.log(`✅ Server is listening on port ${port}`);
  // console.log(`http://localhost:${port}/`);
});
