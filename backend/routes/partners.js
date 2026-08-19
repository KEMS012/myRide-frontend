import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const ref = admin.firestore().collection("partners").doc();
    await ref.set({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error("Create partner error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to create partner. Please try again.") });
  }
}));

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("partners").orderBy("createdAt", "desc").get();
    const partners = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(partners);
  } catch (err) {
    console.error("Get partners error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to load partners. Please try again.") });
  }
}));

router.put("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    await admin.firestore().collection("partners").doc(req.params.id).update(updates);
    res.json({ message: "Partner updated" });
  } catch (err) {
    console.error("Update partner error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to update partner. Please try again.") });
  }
}));

router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.firestore().collection("partners").doc(req.params.id).delete();
    res.json({ message: "Partner deleted" });
  } catch (err) {
    console.error("Delete partner error:", err);
    res.status(400).json({ error: getApiMessage(err, "Failed to remove partner. Please try again.") });
  }
}));

export default router;
