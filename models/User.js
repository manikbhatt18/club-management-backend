const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
  clubsJoined: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
