import "../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../firebase/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const ROLE_ROUTE = {
  rider: "/rider",
  driver: "/driver",
  partners: "/partners",
  admin: "/admin",
};

function Login() {
  const navigate = useNavigate();
  const { login, googleSignIn, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const role = await login(email, password);
      if (role === "partners") {
        const { getPartners } = await import("../services/firestore");
        const partners = await getPartners();
        const match = partners.find((p) => p.code === partnerCode.trim() || p.name === partnerCode.trim());
        if (!match) {
          await logout();
          throw new Error("Invalid partner code. Please contact your organization.");
        }
      }
      navigate(ROLE_ROUTE[role] || "/rider");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setBusy(true);
    try {
      const role = await googleSignIn();
      navigate(ROLE_ROUTE[role] || "/rider");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/myryde-logo.png" alt="MyRyde" className="auth-logo" />

        <h2>Welcome back!</h2>

        <p className="login-text">Login to continue</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <input
            type="text"
            placeholder="Partner Code (if applicable)"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          {error && <p className="auth-error">{error}</p>}

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="login-btn" type="submit" disabled={busy}>
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="or-divider">
          <span></span>
          <p>Or continue with</p>
          <span></span>
        </div>

        <div className="social-login">
          <button className="social-btn" type="button" onClick={handleGoogleSignIn} disabled={busy}>
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
            />
          </button>
        </div>

        <p className="register-text">
          Don't have an account?
          <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

import { getUserMessage } from "../utils/errors";

function friendlyError(err) {
  const msg = err?.message || "";
  if (msg.includes("Invalid email or password.") || msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
    return "Invalid email or password.";
  }
  if (msg.includes("Please enter a valid email.") || msg.includes("invalid-email")) {
    return "Please enter a valid email.";
  }
  if (msg.includes("Too many attempts.")) {
    return "Too many attempts. Try again later.";
  }
  if (msg.includes("No profile found.")) {
    return "No profile found. Please sign up first.";
  }
  if (msg.includes("Database access denied.")) {
    return "Database access denied. Please contact support.";
  }
  return msg || "Login failed. Please try again.";
}

export default Login;
