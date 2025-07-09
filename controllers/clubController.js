const Club = require("../models/Club");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Admin: Create a club
exports.createClub = async (req, res) => {
  try {

    console.log("req.body ", req.body);
    console.log("req.files ", req.files);

    const { name, description } = req.body;
    const imageFile = req.files?.image;

    if (!name || !description || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and image are required",
      });
    }

    
    const uploadResult = await uploadImageToCloudinary(
      imageFile,
      process.env.FOLDER_NAME
    );

    const club = await Club.create({
      name,
      description,
      image: uploadResult.secure_url,
      createdBy: req.user.userId,
    });

    res.status(201).json({ success: true, message: "Club created", club });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating club" });
  }
};

// Admin: View members of a club
exports.getClubMembers = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId).populate("members", "name email");
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }
    res.status(200).json({ success: true, members: club.members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member: Join a club
exports.joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    const user = await User.findById(req.user.userId);

    if (!club || !user) {
      return res.status(404).json({ success: false, message: "Club or user not found" });
    }

    if (club.members.includes(user._id)) {
      return res.status(400).json({ success: false, message: "Already joined this club" });
    }

    club.members.push(user._id);
    user.clubsJoined.push(club._id);

    await club.save();
    await user.save();

    res.status(200).json({ success: true, message: "Club joined successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member: Leave a club
exports.leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    const user = await User.findById(req.user.userId);

    if (!club || !user) {
      return res.status(404).json({ success: false, message: "Club or user not found" });
    }

    club.members = club.members.filter(
      (id) => id.toString() !== user._id.toString()
    );
    user.clubsJoined = user.clubsJoined.filter(
      (id) => id.toString() !== club._id.toString()
    );

    await club.save();
    await user.save();

    res.status(200).json({ success: true, message: "Left club successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member: View joined clubs
exports.getMyClubs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("clubsJoined");
    res.status(200).json({ success: true, clubs: user.clubsJoined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// All users: View all clubs
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().populate("createdBy", "name");
    res.status(200).json({ success: true, clubs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { name, description } = req.body;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: "Club not found" });

    // Only creator can update
    if (req.user.id !== club.createdBy.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (name) club.name = name;
    if (description) club.description = description;

    if (req.files?.image) {
      const uploadedImage = await uploadImageToCloudinary(req.files.image, process.env.FOLDER_NAME);
      club.image = uploadedImage.secure_url;
    }

    await club.save();

    return res.status(200).json({ success: true, message: "Club updated", club });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: "Club not found" });

    if (req.user.id !== club.createdBy.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await club.deleteOne();

    return res.status(200).json({ success: true, message: "Club deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};
