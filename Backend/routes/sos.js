const express = require("express");
const router = express.Router();
const SOSReport = require("../models/SOSReport");

// Fallback store when MongoDB is unavailable
const inMemoryReports = [];
function buildReport({ userId, userName, location, type, description }) {
  return {
    _id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    userName,
    location,
    type: type || "emergency",
    status: "active",
    description: description || "",
    timestamp: new Date(),
  };
}

router.get("/", async (req, res) => {
  try {
    const reports = await SOSReport.find().sort({ timestamp: -1 });
    return res.json(reports);
  } catch (e) {
    // Serve in-memory data when DB is down so UI stays functional
    return res.json(inMemoryReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }
});

router.post("/", async (req, res) => {
  const { userId, userName, location, type, description } = req.body;
  try {
    const report = new SOSReport({ userId, userName, location, type, description });
    const saved = await report.save();
    const io = req.app.get("io");
    io.emit("new_sos", saved);
    return res.status(201).json(saved);
  } catch (e) {
    // Fallback: keep the app responsive if DB is unreachable
    const saved = buildReport({ userId, userName, location, type, description });
    inMemoryReports.push(saved);
    const io = req.app.get("io");
    io.emit("new_sos", saved);
    return res.status(201).json(saved);
  }
});

router.patch("/:id/resolve", async (req, res) => {
  try {
    const report = await SOSReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    report.status = "resolved";
    const updated = await report.save();
    const io = req.app.get("io");
    io.emit("resolve_sos", updated);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SOSReport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    const io = req.app.get("io");
    io.emit("delete_sos", req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/resolved/all", async (req, res) => {
  try {
    const toDelete = await SOSReport.find({ status: "resolved" }).select("_id");
    const ids = toDelete.map((d) => d._id.toString());
    await SOSReport.deleteMany({ status: "resolved" });
    const io = req.app.get("io");
    ids.forEach((id) => io.emit("delete_sos", id));
    res.json({ success: true, deleted: ids.length, ids });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
