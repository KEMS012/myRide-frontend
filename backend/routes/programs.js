import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const ref = admin.firestore().collection("programs").doc();
    await ref.set(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error("Create program error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to create program. Please try again.") });
  }
}));

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("programs").orderBy("createdAt", "desc").get();
    const programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(programs);
  } catch (err) {
    console.error("Get programs error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to load programs. Please try again.") });
  }
}));

router.put("/:id/status", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    await admin.firestore().collection("programs").doc(req.params.id).update({ status });
    res.json({ message: "Program status updated" });
  } catch (err) {
    console.error("Update program status error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to update program. Please try again.") });
  }
}));

export default router;
