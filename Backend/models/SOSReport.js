const mongoose = require("mongoose");

const sosReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  type: { type: String, enum: ["emergency", "medical", "security", "other"], default: "emergency" },
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  description: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SOSReport", sosReportSchema);
