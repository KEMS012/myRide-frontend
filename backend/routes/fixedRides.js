import express from "express";
import admin from "firebase-admin";
import { optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequired } from "../middleware/validate.js";

const router = express.Router();

router.post("/", optionalAuth, validateRequired(["userId", "driverId", "plan", "schedule"]), asyncHandler(async (req, res) => {
  try {
    const { userId, driverId, plan, schedule } = req.body;
    const ref = admin.firestore().collection("fixedRides").doc();
    await ref.set({
      userId: userId || req.user?.uid,
      driverId,
      plan,
      schedule,
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: ref.id, userId, driverId, plan, schedule, status: "active" });
  } catch (err) {
    console.error("Create fixed ride error:", err);
    res.status(400).json({ error: err.message || "Failed to create fixed ride" });
  }
}));

router.get("/", optionalAuth, asyncHandler(async (req, res) => {
  try {
    const { userId } = req.query;
    const uid = userId || req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const q = admin.firestore().collection("fixedRides").where("userId", "==", uid).where("status", "==", "active");
    const snap = await q.get();
    const fixedRides = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(fixedRides);
  } catch (err) {
    console.error("Get fixed rides error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch fixed rides" });
  }
}));

export default router;
