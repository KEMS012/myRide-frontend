import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const ref = admin.firestore().collection("partners").doc();
    await ref.set({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error("Create partner error:", err);
    res.status(400).json({ error: err.message || "Failed to create partner" });
  }
}));

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("partners").orderBy("createdAt", "desc").get();
    const partners = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(partners);
  } catch (err) {
    console.error("Get partners error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch partners" });
  }
}));

router.put("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    await admin.firestore().collection("partners").doc(req.params.id).update(updates);
    res.json({ message: "Partner updated" });
  } catch (err) {
    console.error("Update partner error:", err);
    res.status(400).json({ error: err.message || "Update failed" });
  }
}));

router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("partners").doc(req.params.id).delete();
    res.json({ message: "Partner deleted" });
  } catch (err) {
    console.error("Delete partner error:", err);
    res.status(400).json({ error: err.message || "Delete failed" });
  }
}));

export default router;
