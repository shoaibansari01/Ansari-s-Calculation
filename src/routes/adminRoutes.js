// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/adminController");
const { adminProtect } = require("../middlewares/authMiddleware");

// Admin Login Route
router.post("/login", adminLogin);

// Example of a protected route
router.get("/dashboard", adminProtect, (req, res) => {
  res.status(200).json({
    message: "Welcome to admin dashboard",
    admin: req.admin,
  });
});

module.exports = router;
