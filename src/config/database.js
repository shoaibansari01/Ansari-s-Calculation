const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Optional: Add these for extra stability
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Detailed MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
