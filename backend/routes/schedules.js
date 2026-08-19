import express from "express";
import admin from "firebase-admin";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequired } from "../middleware/validate.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/", optionalAuth, validateRequired(["from", "to", "datetime", "type"]), asyncHandler(async (req, res) => {
  try {
    const { userId, from, to, datetime, type } = req.body;
    const ref = admin.firestore().collection("schedules").doc();
    await ref.set({
      userId: userId || req.user?.uid,
      from,
      to,
      datetime,
      type,
      status: "scheduled",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error("Create schedule error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to schedule ride. Please try again.") });
  }
}));

router.get("/", optionalAuth, asyncHandler(async (req, res) => {
  try {
    const { userId, status } = req.query;
    let q = admin.firestore().collection("schedules").orderBy("datetime", "asc");
    if (userId) q = q.where("userId", "==", userId);
    if (status) q = q.where("status", "==", status);
    const snap = await q.get();
    const schedules = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(schedules);
  } catch (err) {
    console.error("Get schedules error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to load schedules. Please try again.") });
  }
}));

router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("schedules").doc(req.params.id).delete();
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to cancel schedule. Please try again.") });
  }
}));

export default router;
