import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../firebase/useAuth";

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.code?.includes("invalid-email") ? "Enter a valid email." : err?.message || "Could not send reset link.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password?</h2>
        <p className="auth-text">
          Enter your account email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="auth-success">
            <p>Reset link sent to <strong>{email}</strong>.</p>
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" type="submit">Send Reset Link</button>
            <Link to="/login" className="auth-link">Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
