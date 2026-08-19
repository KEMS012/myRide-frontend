import express from "express";
import admin from "firebase-admin";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequired } from "../middleware/validate.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/", optionalAuth, validateRequired(["from", "to", "type"]), asyncHandler(async (req, res) => {
  try {
    const { userId, from, to, type, scheduledAt, riderName, rideFare } = req.body;
    const rideRef = admin.firestore().collection("rides").doc();
    const data = {
      userId: userId || req.user?.uid,
      riderName: riderName || null,
      from,
      to,
      route: `${from} → ${to}`,
      type,
      fare: rideFare || "₦1,200",
      rideFare: rideFare || "₦1,200",
      status: "requested",
      scheduledAt: scheduledAt || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await rideRef.set(data);
    res.status(201).json({ id: rideRef.id, ...data });
  } catch (err) {
    console.error("Create ride error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to create ride. Please try again.") });
  }
}));

router.get("/", optionalAuth, asyncHandler(async (req, res) => {
  try {
    const { userId, driverId, status } = req.query;
    let q = admin.firestore().collection("rides").orderBy("createdAt", "desc");
    if (userId) q = q.where("userId", "==", userId);
    if (driverId) q = q.where("driverId", "==", driverId);
    if (status) q = q.where("status", "==", status);
    const snap = await q.get();
    const rides = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(rides);
  } catch (err) {
    console.error("Get rides error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to fetch rides. Please try again.") });
  }
}));

router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("rides").doc(req.params.id).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Ride not found" });
    }
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Get ride error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to fetch ride. Please try again.") });
  }
}));

router.put("/:id/status", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { status, ...extraData } = req.body;
    await admin.firestore().collection("rides").doc(req.params.id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...extraData,
    });
    res.json({ message: "Ride status updated" });
  } catch (err) {
    console.error("Update ride status error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to update ride status. Please try again.") });
  }
}));

router.post("/:id/accept", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { driverId, driverName } = req.body;
    const activeRides = await admin.firestore().collection("rides").where("driverId", "==", driverId).where("status", "in", ["requested", "accepted"]).get();
    if (!activeRides.empty) {
      return res.status(409).json({ error: "This driver is already assigned to another active ride." });
    }
    await admin.firestore().collection("rides").doc(req.params.id).update({
      status: "accepted",
      driverId,
      driverName: driverName || null,
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Ride accepted" });
  } catch (err) {
    console.error("Accept ride error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to accept ride. Please try again.") });
  }
}));

router.post("/:id/reject", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { reason } = req.body;
    await admin.firestore().collection("rides").doc(req.params.id).update({
      status: "rejected",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectionReason: reason || "rejected",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Ride rejected" });
  } catch (err) {
    console.error("Reject ride error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to reject ride. Please try again.") });
  }
}));

router.post("/:id/complete", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const rideSnap = await admin.firestore().collection("rides").doc(req.params.id).get();
    if (!rideSnap.exists) {
      return res.status(404).json({ error: "Ride not found" });
    }
    const ride = rideSnap.data();
    await admin.firestore().collection("rides").doc(req.params.id).update({
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const rewardRef = admin.firestore().collection("rewards").doc(ride.userId);
    const rewardSnap = await rewardRef.get();
    const existing = rewardSnap.exists ? rewardSnap.data() : { points: 0, ridesCount: 0, tier: "Bronze" };
    const newPoints = existing.points + 100;
    const newRides = existing.ridesCount + 1;
    const newTier = newRides >= 50 ? "Gold" : newRides >= 20 ? "Silver" : "Bronze";
    await rewardRef.set({ userId: ride.userId, points: newPoints, ridesCount: newRides, tier: newTier }, { merge: true });
    res.json({ message: "Ride completed", reward: { points: newPoints, ridesCount: newRides, tier: newTier } });
  } catch (err) {
    console.error("Complete ride error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to complete ride. Please try again.") });
  }
}));

router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("rides").doc(req.params.id).delete();
    res.json({ message: "Ride deleted" });
  } catch (err) {
    console.error("Delete ride error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to delete ride. Please try again.") });
  }
}));

export default router;
