import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/partners", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const partners = [
      { name: "LAUTECH", type: "School", area: "LAUTECH", riders: 880, rides: 3100, contact: "Dean of Students", status: "Active", code: "LAUTECH-2026" },
      { name: "Baptist High School", type: "School", area: "Takie", riders: 410, rides: 1420, contact: "Mr. K. Adeyemi", status: "Active", code: "BHS-2026" },
      { name: "CAC Takie", type: "Church", area: "Takie", riders: 320, rides: 1120, contact: "Pastor D. Oladele", status: "Active", code: "CAC-2026" },
      { name: "Winners Chapel, Owode", type: "Church", area: "Owode", riders: 260, rides: 860, contact: "Pastor M. Thomas", status: "Active", code: "WINNERS-2026" },
    ];
    for (const p of partners) {
      const ref = admin.firestore().collection("partners").doc();
      await ref.set({ id: ref.id, ...p, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    res.json({ message: "Seed data created", count: partners.length });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(400).json({ error: err.message || "Seeding failed" });
  }
}));

export default router;
