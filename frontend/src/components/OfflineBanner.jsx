import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      background: "#b91c1c",
      color: "#fff",
      textAlign: "center",
      padding: "8px 12px",
      fontSize: "0.85rem",
      zIndex: 9999,
      fontWeight: 500,
    }}>
      You're offline. Please check your internet connection.
    </div>
  );
}
