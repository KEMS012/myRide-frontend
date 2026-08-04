import { Link } from "react-router-dom";

function Terms() {
  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <h2>Terms &amp; Conditions</h2>
        <p className="auth-text">Last updated: July 2026 · Ogbomoso, Nigeria</p>

        <div className="terms-body">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By using MyRyde you agree to these terms. MyRyde provides ride
            connection services across Ogbomoso and is not a transporter of
            goods or passengers itself.
          </p>

          <h3>2. Rider &amp; Driver Responsibilities</h3>
          <p>
            All drivers must complete NIN and BVN verification before approval.
            Riders must provide accurate pickup and destination information.
          </p>

          <h3>3. Safety</h3>
          <p>
            Every trip is logged and monitored. Use the in-app SOS feature in
            case of emergency. Next-of-kin contacts are stored securely.
          </p>

          <h3>4. Payments</h3>
          <p>
            Fares are calculated per ride type. Wallet balances and payouts are
            processed according to the platform commission policy.
          </p>

          <h3>5. Privacy</h3>
          <p>
            Personal data (including NIN/BVN) is used only for verification and
            tracking and is protected under our privacy policy.
          </p>
        </div>

        <Link to="/register" className="auth-link">Back to Sign Up</Link>
      </div>
    </div>
  );
}

export default Terms;
