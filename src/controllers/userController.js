// src/controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const HistoricalColumn = require("../models/historicalColumnModel");
const mongoose = require("mongoose");
const WeeklyProfit = require("../models/weeklyProfitModel");

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp: {
        code: otp,
        expiresAt: otpExpires,
      },
    });

    await newUser.save();

    // Send OTP via email with improved template
    await sendEmail(email, "Account Verification", otp);

    res.status(201).json({
      message: "User registered. Please verify OTP",
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup error",
      error: error.message,
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Verification error",
      error: error.message,
    });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP for password reset
    const resetOTP = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = resetOTP;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // Send reset OTP via email with improved template
    await sendEmail(email, "Password Reset", resetOTP);

    res.status(200).json({
      message: "Reset OTP sent",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Forgot password error",
      error: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (
      user.resetPasswordToken !== otp ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      message: "Password reset error",
      error: error.message,
    });
  }
};

// Add Entry to Dynamic Column
exports.addColumnEntry = async (req, res) => {
  try {
    const { userId, columnName, value, date, unit } = req.body;

    // Validate input
    if (!userId || !columnName || value === undefined) {
      return res.status(400).json({
        message: "User ID, column name, and value are required",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Find or create column
    let column = await HistoricalColumn.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      columnName,
    });

    if (!column) {
      // Create new column if not exists
      column = new HistoricalColumn({
        userId: new mongoose.Types.ObjectId(userId),
        columnName,
        entries: [],
        unit: unit || null,
      });
    }

    // Add new entry
    column.entries.push({
      value,
      date: date ? new Date(date) : new Date(),
    });

    // Save column
    await column.save();

    res.status(200).json({
      message: "Entry added successfully",
      entry: {
        value,
        date: date || new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding column entry",
      error: error.message,
    });
  }
};

// Get Column Entries with Optional Date Range
exports.getColumnEntries = async (req, res) => {
  try {
    const { userId, columnName } = req.params;
    const { startDate, endDate } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Build query
    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      columnName,
    };

    // Find column with filtered entries
    const column = await HistoricalColumn.findOne(query);

    if (!column) {
      return res.status(404).json({
        message: "Column not found",
      });
    }

    // Filter entries by date range if provided
    let filteredEntries = column.entries;
    if (startDate || endDate) {
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return (!start || entryDate >= start) && (!end || entryDate <= end);
      });
    }

    res.status(200).json({
      message: "Column entries retrieved successfully",
      columnName: column.columnName,
      unit: column.unit,
      entries: filteredEntries.map((entry) => ({
        value: entry.value,
        date: entry.date,
      })),
      statistics: calculateStatistics(filteredEntries),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving column entries",
      error: error.message,
    });
  }
};

// Get All Columns for a User
exports.getAllUserColumns = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Find all columns for the user
    const columns = await HistoricalColumn.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Process columns with optional date filtering
    const processedColumns = columns.map((column) => {
      // Filter entries by date range if provided
      let filteredEntries = column.entries;
      if (startDate || endDate) {
        filteredEntries = filteredEntries.filter((entry) => {
          const entryDate = new Date(entry.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          return (!start || entryDate >= start) && (!end || entryDate <= end);
        });
      }

      return {
        columnName: column.columnName,
        unit: column.unit,
        entries: filteredEntries.map((entry) => ({
          value: entry.value,
          date: entry.date,
        })),
        statistics: calculateStatistics(filteredEntries),
      };
    });

    res.status(200).json({
      message: "User columns retrieved successfully",
      columns: processedColumns,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving columns",
      error: error.message,
    });
  }
};

// Calculate Basic Statistics
function calculateStatistics(entries) {
  if (entries.length === 0) return null;

  // Check if all values are numbers
  const numericValues = entries
    .map((e) => e.value)
    .filter((v) => typeof v === "number");

  if (numericValues.length === 0) return null;

  return {
    count: numericValues.length,
    total: numericValues.reduce((sum, val) => sum + val, 0),
    average:
      numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
}

// Delete Specific Column Entries
exports.deleteColumnEntries = async (req, res) => {
  try {
    const { userId, columnName } = req.body;
    const { startDate, endDate } = req.query;

    // Validate input
    if (!userId || !columnName) {
      return res.status(400).json({
        message: "User ID and column name are required",
      });
    }

    // Find column
    const column = await HistoricalColumn.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      columnName,
    });

    if (!column) {
      return res.status(404).json({
        message: "Column not found",
      });
    }

    // Filter out entries based on date range
    if (startDate || endDate) {
      column.entries = column.entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return !start || entryDate < start || !end || entryDate > end;
      });
    } else {
      // If no date range, remove all entries
      column.entries = [];
    }

    // Save updated column
    await column.save();

    res.status(200).json({
      message: "Entries deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting column entries",
      error: error.message,
    });
  }
};

function getWeekDates(inputDate) {
  const date = new Date(inputDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// Add Weekly Profit Entry
exports.addWeeklyProfitEntry = async (req, res) => {
  try {
    const { userId, date, amount, description, notes } = req.body;

    // Validate input
    if (!userId || !date || amount === undefined) {
      return res.status(400).json({
        message: "User ID, date, and amount are required",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Get week start and end dates
    const { weekStart, weekEnd } = getWeekDates(date);

    // Find or create weekly profit entry
    let weeklyProfit = await WeeklyProfit.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
    });

    if (!weeklyProfit) {
      // Create new weekly profit entry
      weeklyProfit = new WeeklyProfit({
        userId: new mongoose.Types.ObjectId(userId),
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        entries: [],
        totalProfit: 0,
        notes: notes || "",
      });
    }

    // Add new entry
    const newEntry = {
      date: new Date(date),
      amount: Number(amount),
      description: description || "",
    };
    weeklyProfit.entries.push(newEntry);

    // Update total profit
    weeklyProfit.totalProfit = weeklyProfit.entries.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    // Update notes if provided
    if (notes) {
      weeklyProfit.notes = notes;
    }

    // Save weekly profit
    await weeklyProfit.save();

    res.status(200).json({
      message: "Profit entry added successfully",
      entry: newEntry,
      totalProfit: weeklyProfit.totalProfit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding profit entry",
      error: error.message,
    });
  }
};

// Get Weekly Profit Entries
exports.getWeeklyProfitEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Build query
    const query = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    // Add date range filtering if provided
    if (startDate && endDate) {
      query.weekStartDate = { $gte: new Date(startDate) };
      query.weekEndDate = { $lte: new Date(endDate) };
    }

    // Find weekly profit entries
    const weeklyProfitEntries = await WeeklyProfit.find(query).sort({
      weekStartDate: 1,
    });

    // Prepare response
    const formattedEntries = weeklyProfitEntries.map((entry) => ({
      weekStartDate: entry.weekStartDate,
      weekEndDate: entry.weekEndDate,
      totalProfit: entry.totalProfit,
      entries: entry.entries,
      notes: entry.notes,
    }));

    // Calculate overall statistics
    const overallStats = {
      totalWeeks: formattedEntries.length,
      totalProfit: formattedEntries.reduce(
        (sum, entry) => sum + entry.totalProfit,
        0
      ),
      averageWeeklyProfit:
        formattedEntries.length > 0
          ? formattedEntries.reduce(
              (sum, entry) => sum + entry.totalProfit,
              0
            ) / formattedEntries.length
          : 0,
    };

    res.status(200).json({
      message: "Weekly profit entries retrieved successfully",
      entries: formattedEntries,
      overallStats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving weekly profit entries",
      error: error.message,
    });
  }
};

// Delete Weekly Profit Entry
exports.deleteWeeklyProfitEntry = async (req, res) => {
  try {
    const { userId, entryId } = req.body;

    // Validate input
    if (!userId || !entryId) {
      return res.status(400).json({
        message: "User ID and entry ID are required",
      });
    }

    // Find and update the weekly profit entry
    const weeklyProfit = await WeeklyProfit.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      "entries._id": new mongoose.Types.ObjectId(entryId),
    });

    if (!weeklyProfit) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    // Remove the specific entry
    weeklyProfit.entries = weeklyProfit.entries.filter(
      (entry) => entry._id.toString() !== entryId
    );

    // Recalculate total profit
    weeklyProfit.totalProfit = weeklyProfit.entries.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    // Save updated entry
    await weeklyProfit.save();

    res.status(200).json({
      message: "Entry deleted successfully",
      totalProfit: weeklyProfit.totalProfit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting profit entry",
      error: error.message,
    });
  }
};

// Calculate Net Profit Across All Dates
exports.calculateNetProfitSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    // Find all columns for the user
    const columns = await HistoricalColumn.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Find all weekly profit entries for the user
    const weeklyProfitEntries = await WeeklyProfit.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Create a map to store daily calculations
    const dailyCalculations = new Map();

    // Process column entries
    columns.forEach((column) => {
      column.entries.forEach((entry) => {
        const entryDate = new Date(entry.date).toISOString().split("T")[0];

        if (!dailyCalculations.has(entryDate)) {
          dailyCalculations.set(entryDate, {
            totalColumnValue: 0,
            totalProfit: 0,
          });
        }

        const dailyData = dailyCalculations.get(entryDate);
        if (typeof entry.value === "number") {
          dailyData.totalColumnValue += entry.value;
        }
      });
    });

    // Process profit entries
    weeklyProfitEntries.forEach((weekProfit) => {
      weekProfit.entries.forEach((entry) => {
        const entryDate = new Date(entry.date).toISOString().split("T")[0];

        if (!dailyCalculations.has(entryDate)) {
          dailyCalculations.set(entryDate, {
            totalColumnValue: 0,
            totalProfit: 0,
          });
        }

        const dailyData = dailyCalculations.get(entryDate);
        dailyData.totalProfit += entry.amount;
      });
    });

    // Calculate net profit for each date
    const netProfitSummary = Array.from(dailyCalculations.entries())
      .map(([date, data]) => ({
        date,
        totalColumnValue: data.totalColumnValue,
        totalProfit: data.totalProfit,
        netProfit: data.totalProfit - data.totalColumnValue,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate overall summary
    const overallSummary = netProfitSummary.reduce(
      (summary, daily) => {
        summary.totalColumnValueOverall += daily.totalColumnValue;
        summary.totalProfitOverall += daily.totalProfit;
        summary.netProfitOverall += daily.netProfit;
        return summary;
      },
      {
        totalColumnValueOverall: 0,
        totalProfitOverall: 0,
        netProfitOverall: 0,
      }
    );

    res.status(200).json({
      message: "Net profit calculated successfully",
      dailyNetProfit: netProfitSummary,
      overallSummary: {
        totalColumnValue: overallSummary.totalColumnValueOverall,
        totalProfit: overallSummary.totalProfitOverall,
        netProfit: overallSummary.netProfitOverall,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating net profit",
      error: error.message,
    });
  }
};
