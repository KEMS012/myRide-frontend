import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendVerificationCode, verifyCode, user } = useAuth();
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const email = user?.email || searchParams.get("email") || "";

  const handleSendCode = async () => {
    setError("");
    setBusy(true);
    try {
      await sendVerificationCode();
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await verifyCode(code);
      navigate("/login?verified=1");
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/myryde-logo.png" alt="MyRyde" className="auth-logo" />
        <h2>Verify your email</h2>
        <p className="auth-text">
          We sent a 6-digit verification code to <strong>{email}</strong>.
        </p>

        {!sent ? (
          <button className="auth-btn" onClick={handleSendCode} disabled={busy}>
            {busy ? "Sending..." : "Send Verification Code"}
          </button>
        ) : (
          <form className="auth-form" onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
            />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" type="submit" disabled={busy}>
              {busy ? "Verifying..." : "Verify Email"}
            </button>
            <button type="button" className="auth-link" onClick={handleSendCode} disabled={busy}>
              Resend code
            </button>
          </form>
        )}

        <Link to="/login" className="auth-link">Back to Login</Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
