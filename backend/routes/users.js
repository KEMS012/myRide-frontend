import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch users" });
  }
}));

router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("users").doc(req.params.id).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch user" });
  }
}));

router.put("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    await admin.firestore().collection("users").doc(req.params.id).update(updates);
    const snap = await admin.firestore().collection("users").doc(req.params.id).get();
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(400).json({ error: err.message || "Update failed" });
  }
}));

router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("users").doc(req.params.id).delete();
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(400).json({ error: err.message || "Delete failed" });
  }
}));

export default router;
