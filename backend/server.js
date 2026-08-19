import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { getApiMessage } from "./utils/errors.js";
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
import emergencyRoutes from "./routes/emergency.js";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || corsOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/fixed-rides", fixedRideRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/emergency", emergencyRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: getApiMessage(err, "Something went wrong. Please try again or contact support.") });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`MyRyde backend running on port ${PORT}`);
});
