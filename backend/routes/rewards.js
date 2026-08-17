import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/:userId", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("rewards").doc(req.params.userId).get();
    const data = snap.exists ? snap.data() : null;
    res.json(data || { userId: req.params.userId, points: 0, ridesCount: 0, tier: "Bronze" });
  } catch (err) {
    console.error("Get reward error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch reward" });
  }
}));

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { userId, points = 0, ridesCount = 0 } = req.body;
    const ref = admin.firestore().collection("rewards").doc(userId);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : { points: 0, ridesCount: 0, tier: "Bronze" };
    const newPoints = existing.points + points;
    const newRides = existing.ridesCount + ridesCount;
    const newTier = newRides >= 50 ? "Gold" : newRides >= 20 ? "Silver" : "Bronze";
    await ref.set({ userId, points: newPoints, ridesCount: newRides, tier: newTier }, { merge: true });
    res.json({ userId, points: newPoints, ridesCount: newRides, tier: newTier });
  } catch (err) {
    console.error("Create reward error:", err);
    res.status(400).json({ error: err.message || "Failed to create reward" });
  }
}));

export default router;
