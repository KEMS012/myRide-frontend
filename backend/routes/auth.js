import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequired } from "../middleware/validate.js";
import { getApiMessage } from "../utils/errors.js";

const router = express.Router();

router.post("/signup", validateRequired(["name", "email", "password"]), asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone, role, ...extra } = req.body;
    const userRecord = await admin.auth().createUser({ email, password, displayName: name, phoneNumber: phone });
    const profileData = {
      uid: userRecord.uid,
      name,
      email,
      phone,
      role: role || "rider",
      status: role === "driver" ? "Pending" : "Active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...extra,
    };
    await admin.firestore().collection("users").doc(userRecord.uid).set(profileData);
    res.status(201).json({ uid: userRecord.uid, ...profileData });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: getApiMessage(err, "Sign up failed. Please check your details and try again.") });
  }
}));

router.post("/login", validateRequired(["email"]), asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const userRecord = await admin.auth().getUserByEmail(email);
    const snap = await admin.firestore().collection("users").doc(userRecord.uid).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "No profile found. Please sign up first." });
    }
    const data = snap.data();
    res.json({ uid: userRecord.uid, ...data });
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: getApiMessage(err, "Login failed. Please check your email and password.") });
  }
}));

router.post("/google", validateRequired(["idToken"]), asyncHandler(async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const snap = await admin.firestore().collection("users").doc(decoded.uid).get();
    const data = snap.exists ? snap.data() : {
      uid: decoded.uid,
      name: decoded.name || "Google User",
      email: decoded.email,
      phone: decoded.phone_number || "",
      role: "rider",
      status: "Active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!snap.exists) {
      await admin.firestore().collection("users").doc(decoded.uid).set(data);
    }
    res.json(data);
  } catch (err) {
    console.error("Google sign-in error:", err);
    res.status(401).json({ error: getApiMessage(err, "Google sign-in failed. Please try again.") });
  }
}));

router.post("/reset-password", validateRequired(["email"]), asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    await admin.auth().getUserByEmail(email);
    await admin.auth().generatePasswordResetLink(email);
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: getApiMessage(err, "Password reset failed. Please check the email and try again.") });
  }
}));

router.post("/logout", authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(400).json({ error: getApiMessage(err, "Logout failed. Please try again.") });
  }
}));

router.get("/me", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const snap = await admin.firestore().collection("users").doc(req.user.uid).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: getApiMessage(err, "Failed to load profile. Please try again.") });
  }
}));

router.put("/me", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    await admin.firestore().collection("users").doc(req.user.uid).update(updates);
    const snap = await admin.firestore().collection("users").doc(req.user.uid).get();
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({ error: getApiMessage(err, "Update failed. Please try again.") });
  }
}));

export default router;
