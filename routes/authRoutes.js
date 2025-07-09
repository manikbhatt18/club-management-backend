const express = require("express");
const router = express.Router();


const { signup, login, getProfile } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/auth");

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected
router.get("/profile", isAuthenticated, getProfile);

module.exports = router;