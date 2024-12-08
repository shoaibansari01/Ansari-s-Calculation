// src/seed/adminSeed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/adminModel");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "superadmin" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // Create new admin
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
