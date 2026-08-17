import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const ref = admin.firestore().collection("programs").doc();
    await ref.set(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error("Create program error:", err);
    res.status(400).json({ error: err.message || "Failed to create program" });
  }
}));

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("programs").orderBy("createdAt", "desc").get();
    const programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(programs);
  } catch (err) {
    console.error("Get programs error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch programs" });
  }
}));

router.put("/:id/status", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    await admin.firestore().collection("programs").doc(req.params.id).update({ status });
    res.json({ message: "Program status updated" });
  } catch (err) {
    console.error("Update program status error:", err);
    res.status(400).json({ error: err.message || "Update failed" });
  }
}));

export default router;
