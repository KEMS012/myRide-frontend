import "../styles/login.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [searchParams] = useSearchParams();
  const { login, googleSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setVerifiedMessage("Account created! Please verify your email before logging in. Check your inbox for the verification link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const role = await login(email, password);
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

          {verifiedMessage && <p className="auth-success">{verifiedMessage}</p>}

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
  const code = err?.code || "";
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential"))
    return "Invalid email or password.";
  if (code.includes("invalid-email")) return "Please enter a valid email.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again later.";
  if (code.includes("not-configured")) return "Firebase is not configured yet.";
  return getUserMessage(err, "Login failed. Please try again.");
}

export default Login;
