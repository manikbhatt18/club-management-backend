const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Club name is required"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Club description is required"],
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/300", // default image in case none is provided
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Club", clubSchema);
