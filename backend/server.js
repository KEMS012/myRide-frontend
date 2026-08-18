import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import rideRoutes from "./routes/rides.js";
import scheduleRoutes from "./routes/schedules.js";
import partnerRoutes from "./routes/partners.js";
import programRoutes from "./routes/programs.js";
import notificationRoutes from "./routes/notifications.js";
import rewardRoutes from "./routes/rewards.js";
import fixedRideRoutes from "./routes/fixedRides.js";
import seedRoutes from "./routes/seed.js";
import verificationRoutes from "./routes/verification.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/fixed-rides", fixedRideRoutes);
app.use("/api/seed", seedRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`MyRyde backend running on port ${PORT}`);
});
