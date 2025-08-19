const express = require("express");
const router = express.Router();
const SOSReport = require("../models/SOSReport");

router.get("/", async (req, res) => {
  try {
    const reports = await SOSReport.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, userName, location, type, description } = req.body;
    const report = new SOSReport({ userId, userName, location, type, description });
    const saved = await report.save();
    const io = req.app.get("io");
    io.emit("new_sos", saved);
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ message: e.message });
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
