import express from "express";
import admin from "firebase-admin";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(to, subject, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
}

router.post("/send-verification-code", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await admin.firestore().collection("users").doc(uid).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "User profile not found." });
    }
    const data = snap.data();
    if (data.emailVerified) {
      return res.json({ message: "Email already verified." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await admin.firestore().collection("verificationCodes").doc(uid).set({
      uid,
      email: data.email,
      code,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendMail(
      data.email,
      "MyRyde Email Verification Code",
      `Your verification code is ${code}. It expires in 10 minutes.`
    );

    res.json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("Send verification code error:", err);
    res.status(500).json({ error: "Failed to send verification code." });
  }
}));

router.post("/verify-code", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const uid = req.user.uid;
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Verification code is required." });
    }

    const codeSnap = await admin.firestore().collection("verificationCodes").doc(uid).get();
    if (!codeSnap.exists) {
      return res.status(400).json({ error: "No verification code found. Please request a new code." });
    }

    const record = codeSnap.data();
    if (new Date() > record.expiresAt.toDate()) {
      await codeSnap.ref.delete();
      return res.status(400).json({ error: "Verification code expired. Please request a new code." });
    }

    if (record.code !== String(code)) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    await admin.firestore().collection("users").doc(uid).update({ emailVerified: true });
    await codeSnap.ref.delete();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ error: "Verification failed." });
  }
}));

export default router;
