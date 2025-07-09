const express = require("express");
const router = express.Router();

const {
  createClub,
  getAllClubs,
  joinClub,
  leaveClub,
  getMyClubs,
  getClubMembers,
  updateClub,
  deleteClub,
} = require("../controllers/clubController");

const { isAuthenticated, isAdmin, isMember } = require("../middleware/auth");

// Admin-only
router.post("/create", isAuthenticated, isAdmin, createClub);
router.get("/members/:clubId", isAuthenticated, isAdmin, getClubMembers);

// Member-only
router.post("/join/:clubId", isAuthenticated, isMember, joinClub);
router.post("/leave/:clubId", isAuthenticated, isMember, leaveClub);
router.get("/my-clubs", isAuthenticated, isMember, getMyClubs);

// Public for all authenticated users
router.get("/all", isAuthenticated, getAllClubs);


router.put("/:clubId", isAuthenticated, isAdmin, updateClub);
router.delete("/:clubId", isAuthenticated, isAdmin, deleteClub);

module.exports = router;
