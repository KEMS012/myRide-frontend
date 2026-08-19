import express from "express";
import admin from "firebase-admin";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.get("/", optionalAuth, asyncHandler(async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }
    const q = admin.firestore().collection("notifications").where("recipientId", "==", uid).orderBy("createdAt", "desc");
    const snap = await q.get();
    const notifications = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to load notifications. Please try again.") });
  }
}));

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const ref = admin.firestore().collection("notifications").doc();
    await ref.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    res.status(201).json({ id: ref.id, ...data, read: false });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to create notification. Please try again.") });
  }
}));

router.put("/:id/read", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("notifications").doc(req.params.id).update({ read: true });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to update notification. Please try again.") });
  }
}));

export default router;
