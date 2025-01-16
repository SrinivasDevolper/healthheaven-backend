const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const adminRouter = require("./routes/adminRoute");
const RouterAuth = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
// Load environment variables
dotenv.config();

// Express Setup
const app = express();
app.use(cors());
app.use(express.json());

//api end points
app.use("/api/healthheaven", RouterAuth);
app.use("/api/healthheaven/admin", adminRouter);
app.use("/api/healthheaven", userRouter);
app.get("/", (req, res) => {
  return res.send("working");
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// POST Endpoint for File Upload
