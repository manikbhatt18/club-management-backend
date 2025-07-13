const express = require("express");
const router = express.Router();

const {
  createClub,
  getAllClubs,
  getClubById,
  joinClub,
  leaveClub,
  getMyClubs,
  getClubMembers,
  updateClub,
  deleteClub,
} = require("../controllers/clubController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Admin-only
router.post("/create", isAuthenticated, isAdmin, createClub);
router.get("/members/:clubId", isAuthenticated, isAdmin, getClubMembers);
router.put("/update/:clubId", isAuthenticated, isAdmin, updateClub);
router.delete("/:clubId", isAuthenticated, isAdmin, deleteClub);

// All authenticated users (both admin and member)
router.post("/join/:clubId", isAuthenticated, joinClub);
router.post("/leave/:clubId", isAuthenticated, leaveClub);
router.get("/my-clubs", isAuthenticated, getMyClubs);

// Public for all authenticated users
router.get("/all", isAuthenticated, getAllClubs);
router.get("/:clubId", isAuthenticated, getClubById);

module.exports = router;
