import { useState } from "react";
import { FaLock, FaCheck, FaXmark, FaSpinner } from "react-icons/fa6";
import { getUserMessage } from "../utils/errors";

export default function PaymentModal({ open, onClose, onSuccess, rideDetails }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handlePay = async () => {
    setProcessing(true);
    setError("");
    try {
      const reference = `MYRYDE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: rideDetails?.email || "rider@myryde.app",
          amount: Math.round(Number(rideDetails?.amount || 1200) * 100),
          ref: reference,
          currency: "NGN",
          onClose: () => {
            setProcessing(false);
            setError("Payment cancelled. You can try again when you're ready.");
          },
          callback: async (response) => {
            try {
              await fetch("https://api.paystack.co/transaction/verify/" + response.reference, {
                headers: {
                  Authorization: `Bearer ${import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}`,
                },
              });
              onSuccess?.(response.reference);
            } catch (err) {
              setError(getUserMessage(err, "Payment verification failed. Please try again or contact support."));
              setProcessing(false);
            }
          },
        });
        handler.openIframe();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(getUserMessage(err, "Payment initialization failed. Please check your connection and try again."));
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {import.meta.env.VITE_PAYSTACK_TEST_MODE === "true" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#f59e0b", color: "#fff", padding: "10px 16px", textAlign: "center", fontWeight: 600, zIndex: 9999, fontSize: "0.9rem" }}>
          TEST MODE — No real payment will be processed
        </div>
      )}
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", marginTop: import.meta.env.VITE_PAYSTACK_TEST_MODE === "true" ? "36px" : "0" }}>
        <button className="modal-close" onClick={onClose}><FaXmark /></button>
        <div className="modal-icon" style={{ marginBottom: "12px" }}><FaLock /></div>
        <h2>Confirm Payment</h2>
        <p className="muted">Complete payment to book your ride.</p>

        <div style={{ background: "var(--surface-2, #f5f5f5)", borderRadius: "12px", padding: "16px", margin: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span>Ride Type</span>
            <strong>{rideDetails?.type || "Standard Ride"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span>Route</span>
            <strong>{rideDetails?.from || "—"} → {rideDetails?.to || "—"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #ddd", paddingTop: "8px", marginTop: "8px" }}>
            <span>Total</span>
            <strong style={{ fontSize: "1.1rem" }}>₦{Number(rideDetails?.amount || 1200).toLocaleString()}</strong>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <button className="qb-btn full" onClick={handlePay} disabled={processing}>
          {processing ? <><FaSpinner className="spin" /> Processing...</> : <><FaCheck /> Pay Now</>}
        </button>
        <p style={{ textAlign: "center", marginTop: "12px", fontSize: "0.8rem", opacity: 0.7 }}>
          Secured by Paystack
        </p>
      </div>
    </div>
  );
}
