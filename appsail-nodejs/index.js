const express = require('express');
require("dotenv").config();

const mongoConnection = require("./src/configs/mongo.config.js")
const userRoutes = require("./src/routes/user.route.js")
// const documentRoutes = require("./src/routes/document.route.js")

const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;



app.use(express.json());
app.use("/api/users", userRoutes);
// app.use("/api/documents", documentRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, async () => {
  await mongoConnection();
  console.log(`✅ Server is listening on port ${port}`);
  // console.log(`http://localhost:${port}/`);
});
