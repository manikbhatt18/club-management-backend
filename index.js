const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database");
const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/cloudinary");

// Load env variables
dotenv.config();

// Connect to Cloudinary
cloudinaryConnect();

// Initialize app
const app = express();
const PORT = process.env.PORT || 4000;

// 🛡️ Fix CORS for cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite frontend
    credentials: true,
  })
);

// Middleware
app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/clubs", require("./routes/clubRoutes"));

// DB connection
connectDB.connect();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
