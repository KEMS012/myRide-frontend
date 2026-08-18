import "../styles/signup.css";
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

function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [role, setRole] = useState("rider");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    vehicle: "",
    license: "",
    nin: "",
    bvn: "",
    nextOfKin: "",
    address: "",
    town: "",
    experience: "",
    previousWorkplace: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    let finalRole = role;
    if (adminCode.trim() === "MYRYDE-ADMIN-2026") {
      finalRole = "admin";
    }

    const base = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: finalRole,
    };

    if (role === "driver") {
      if (!form.vehicle || !form.license || !form.nin || !form.bvn || !form.nextOfKin || !form.address || !form.town) {
        setError("Please fill all driver verification fields.");
        return;
      }
      Object.assign(base, {
        vehicle: form.vehicle,
        license: form.license,
        nin: form.nin,
        bvn: form.bvn,
        nextOfKin: form.nextOfKin,
        address: form.address,
        town: form.town,
        experience: form.experience,
        previousWorkplace: form.previousWorkplace,
        status: "pending",
      });
    }

    setBusy(true);
    try {
      const result = await signup(base);
      navigate(`/verify-email?email=${encodeURIComponent(base.email)}`);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <img src="/myryde-logo.png" alt="MyRyde" className="register-logo" />

        <h2>Create your account</h2>
        <p className="register-subtitle">Join thousands of passengers in Ogbomoso</p>

        <div className="role-selector">
          <button
            className={role === "rider" ? "active-role" : ""}
            onClick={() => setRole("rider")}
            type="button"
          >
            I'm a Passenger
          </button>

          <button
            className={role === "driver" ? "active-role" : ""}
            onClick={() => setRole("driver")}
            type="button"
          >
            I'm a Driver
          </button>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={form.name} onChange={update("name")} required />
          <input type="text" placeholder="Phone Number" value={form.phone} onChange={update("phone")} required />
          <input type="email" placeholder="Email Address" value={form.email} onChange={update("email")} required />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={update("password")}
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
          <div className="password-field">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={update("confirm")}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {role === "driver" && (
            <div className="driver-fields">
              <input type="text" placeholder="Vehicle (e.g. Bajaj Boxer)" value={form.vehicle} onChange={update("vehicle")} required />
              <input type="text" placeholder="License Number" value={form.license} onChange={update("license")} required />
              <input type="text" placeholder="NIN" value={form.nin} onChange={update("nin")} required />
              <input type="text" placeholder="BVN" value={form.bvn} onChange={update("bvn")} required />
              <input type="text" placeholder="Next of Kin (Name + Phone)" value={form.nextOfKin} onChange={update("nextOfKin")} required />
              <input type="text" placeholder="Residential Address" value={form.address} onChange={update("address")} required />
              <input type="text" placeholder="Town / Area" value={form.town} onChange={update("town")} required />
              <input type="text" placeholder="Years of Experience" value={form.experience} onChange={update("experience")} />
              <input type="text" placeholder="Previous Workplace" value={form.previousWorkplace} onChange={update("previousWorkplace")} />
            </div>
          )}

          <input
            type="text"
            placeholder="Admin Access Code (optional)"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="admin-code-input"
          />

          {error && <p className="auth-error">{error}</p>}

          <div className="terms">
            <label>
              <input type="checkbox" required />
              I agree to the
              <Link to="/terms">Terms &amp; Conditions</Link>
            </label>
          </div>

          <button className="signup-btn" type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

import { getUserMessage } from "../utils/errors";

function friendlyError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists.";
  if (code.includes("weak-password")) return "Password is too weak (min 6 chars).";
  if (code.includes("invalid-email")) return "Please enter a valid email.";
  if (code.includes("not-configured")) return "Firebase is not configured yet.";
  return getUserMessage(err, "Sign up failed. Please try again.");
}

export default Register;
