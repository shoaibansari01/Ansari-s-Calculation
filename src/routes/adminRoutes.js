// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/adminController");
const { adminProtect } = require("../middlewares/authMiddleware");

// Admin Login Route
router.post("/login", adminLogin);

module.exports = router;
