// src/models/adminModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

// Seed Admin Function
const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "superadmin" });
    if (existingAdmin) return;

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new Admin({
      username: "superadmin",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin seeded successfully");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

module.exports = {
  Admin,
  seedAdmin,
};
