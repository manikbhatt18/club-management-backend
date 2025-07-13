const Club = require("../models/Club");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");




exports.createClub = async (req, res) => {
  try {

    console.log("req.user:", req.user);
    const { name, description, category } = req.body;
    const thumbnail = req.files?.image;
    const userId = req.user.userId;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, category) are required",
      });
    }

    // Check if club with same name exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(409).json({
        success: false,
        message: "Club with this name already exists",
      });
    }

    // Upload image to Cloudinary
    let imageUrl = "https://via.placeholder.com/300"; // default
    if (thumbnail) {
      const uploaded = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      imageUrl = uploaded.secure_url;
    }

    // Create club
    const club = await Club.create({
      name,
      description,
      image: imageUrl,
      category,
      createdBy: userId,
      members: [userId], // creator is also a member
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      club,
    });
  } catch (error) {
    console.error("Error creating club:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    console.log("🤝 JOIN CLUB REQUEST - User ID:", req.user.userId, "Club ID:", req.params.clubId);
    
    const club = await Club.findById(req.params.clubId);
    const user = await User.findById(req.user.userId);

    console.log("🔍 Club found:", club ? "Yes" : "No", "User found:", user ? "Yes" : "No");

    if (!club || !user) {
      console.log("❌ Club or user not found");
      return res.status(404).json({ success: false, message: "Club or user not found" });
    }

    console.log("👥 Current members:", club.members);
    console.log("👤 User ID to check:", user._id);

    if (club.members.includes(user._id)) {
      console.log("⚠️ User already a member");
      return res.status(400).json({ success: false, message: "Already joined this club" });
    }

    club.members.push(user._id);
    user.clubsJoined.push(club._id);

    await club.save();
    await user.save();

    console.log("✅ Successfully joined club. New member count:", club.members.length);
    res.status(200).json({ success: true, message: "Club joined successfully" });
  } catch (err) {
    console.error("❌ Error in joinClub:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member: Leave a club
exports.leaveClub = async (req, res) => {
  try {
    console.log("👋 LEAVE CLUB REQUEST - User ID:", req.user.userId, "Club ID:", req.params.clubId);
    
    const club = await Club.findById(req.params.clubId);
    const user = await User.findById(req.user.userId);

    console.log("🔍 Club found:", club ? "Yes" : "No", "User found:", user ? "Yes" : "No");

    if (!club || !user) {
      console.log("❌ Club or user not found");
      return res.status(404).json({ success: false, message: "Club or user not found" });
    }

    console.log("👥 Current members before leaving:", club.members);

    club.members = club.members.filter(
      (id) => id.toString() !== user._id.toString()
    );
    user.clubsJoined = user.clubsJoined.filter(
      (id) => id.toString() !== club._id.toString()
    );

    await club.save();
    await user.save();

    console.log("✅ Successfully left club. New member count:", club.members.length);
    res.status(200).json({ success: true, message: "Left club successfully" });
  } catch (err) {
    console.error("❌ Error in leaveClub:", err);
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

// Get a single club by ID
exports.getClubById = async (req, res) => {
  try {
    console.log("🔍 GET CLUB BY ID - Club ID:", req.params.clubId);
    
    const club = await Club.findById(req.params.clubId)
      .populate("createdBy", "name email")
      .populate("members", "name email");
    
    if (!club) {
      console.log("❌ Club not found");
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    console.log("✅ Club found:", club.name, "Members:", club.members?.length || 0);
    res.status(200).json({ success: true, club });
  } catch (err) {
    console.error("❌ Error in getClubById:", err);
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
    console.log("🔄 UPDATE CLUB REQUEST - Club ID:", req.params.clubId, "User ID:", req.user.userId);
    
    const { clubId } = req.params;
    const { name, description, category } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      console.log("❌ Club not found");
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    console.log("🔍 Club found:", club.name, "Created by:", club.createdBy);

    // Only creator can update
    if (req.user.userId !== club.createdBy.toString()) {
      console.log("❌ Unauthorized - User ID:", req.user.userId, "Club creator:", club.createdBy);
      return res.status(403).json({ success: false, message: "Unauthorized - Only club creator can update" });
    }

    console.log("✅ Authorization passed, updating club...");

    // Update fields if provided
    if (name) {
      // Check if name is being changed and if it conflicts with existing club
      if (name !== club.name) {
        const existingClub = await Club.findOne({ name, _id: { $ne: clubId } });
        if (existingClub) {
          return res.status(409).json({
            success: false,
            message: "Club with this name already exists",
          });
        }
      }
      club.name = name;
    }
    
    if (description) club.description = description;
    if (category) club.category = category;

    // Handle image upload
    if (req.files?.image) {
      console.log("📸 Uploading new image...");
      const uploadedImage = await uploadImageToCloudinary(req.files.image, process.env.FOLDER_NAME);
      club.image = uploadedImage.secure_url;
    }

    await club.save();
    console.log("✅ Club updated successfully");

    return res.status(200).json({ 
      success: true, 
      message: "Club updated successfully", 
      club 
    });
  } catch (err) {
    console.error("❌ Error in updateClub:", err);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: "Club not found" });

    if (req.user.userId !== club.createdBy.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await club.deleteOne();

    return res.status(200).json({ success: true, message: "Club deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};
