// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  userSignup,
  verifyOTP,
  userLogin,
  forgotPassword,
  resetPassword,
  addColumnEntry,
  getColumnEntries,
  deleteColumnEntries,
  getAllUserColumns,
  addWeeklyProfitEntry,
  getWeeklyProfitEntries,
  deleteWeeklyProfitEntry,
} = require("../controllers/userController");
const { userProtect } = require("../middlewares/authMiddleware");

// User Signup Route
router.post("/signup", userSignup);

// OTP Verification Route
router.post("/verify-otp", verifyOTP);

// User Login Route
router.post("/login", userLogin);

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Reset Password Route
router.post("/reset-password", resetPassword);

// Add Entry to Dynamic Column
router.post("/column-entry", userProtect, addColumnEntry);

// Get Column Entries (with optional date filtering)
router.get(
  "/column-entries/:userId/:columnName",
  userProtect,
  getColumnEntries
);

// Delete Column Entries
router.delete("/column-entries", userProtect, deleteColumnEntries);

// Get All Columns for a User (with optional date filtering)
router.get("/all-columns/:userId", userProtect, getAllUserColumns);

// Add Weekly Profit Entry
router.post("/profit-entry", userProtect, addWeeklyProfitEntry);

// Get Weekly Profit Entries (with optional date filtering)
router.get("/getprofit-entries/:userId", userProtect, getWeeklyProfitEntries);

// Delete Specific Profit Entry
router.delete("/delete-profit-entry", userProtect, deleteWeeklyProfitEntry);

module.exports = router;
