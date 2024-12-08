const mongoose = require("mongoose");

const historicalColumnSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    columnName: {
      type: String,
      required: true,
    },
    entries: [
      {
        value: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    unit: {
      type: String,
      default: null, // Optional unit of measurement
    },
  },
  {
    timestamps: true,
    // Ensure unique combination of userId and columnName
    indexes: [
      {
        unique: true,
        fields: ["userId", "columnName"],
      },
    ],
  }
);

module.exports = mongoose.model("HistoricalColumn", historicalColumnSchema);
