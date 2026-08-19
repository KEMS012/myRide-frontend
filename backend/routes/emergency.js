import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const uid = req.user.uid;
    const { location, message, contacts = [] } = req.body;

    const userSnap = await admin.firestore().collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "Your profile was not found. Please sign in again." });
    }
    const user = userSnap.data();

    const alertRef = admin.firestore().collection("emergencyAlerts").doc();
    const alertData = {
      userId: uid,
      userName: user.name || "Unknown",
      userEmail: user.email || "",
      userPhone: user.phone || "",
      location: location || "",
      message: message || "Emergency SOS",
      contacts: contacts || [],
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await alertRef.set(alertData);

    const adminsSnap = await admin.firestore().collection("users").where("role", "==", "admin").get();
    const adminNotifications = adminsSnap.docs.map((adminDoc) => ({
      recipientId: adminDoc.id,
      recipientRole: "admin",
      alertId: alertRef.id,
      title: "EMERGENCY SOS",
      message: `${user.name || "A user"} triggered an emergency alert. Location: ${location || "Not provided"}. Message: ${message || "No message"}`,
      type: "emergency_sos",
      read: false,
    }));

    const batch = admin.firestore().batch();
    for (const notif of adminNotifications) {
      const notifRef = admin.firestore().collection("notifications").doc();
      batch.set(notifRef, {
        ...notif,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    res.status(201).json({ message: "Emergency alert sent. Admin has been notified.", alertId: alertRef.id });
  } catch (err) {
    console.error("Emergency alert error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to send emergency alert. Please try again.") });
  }
}));

export default router;
