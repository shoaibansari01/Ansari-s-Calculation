const mongoose = require("mongoose");

const weeklyProfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    entries: [
      {
        date: {
          type: Date,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Ensure unique week for a user
    indexes: [
      {
        unique: true,
        fields: ["userId", "weekStartDate", "weekEndDate"],
      },
    ],
  }
);

module.exports = mongoose.model("WeeklyProfit", weeklyProfitSchema);
