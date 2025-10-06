const express = require('express');
require("dotenv").config();

const userRoutes = require("./src/routes/user.route.js")

const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;



app.use(express.json());
app.use("/api/users", userRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`http://localhost:${port}/`);
});
