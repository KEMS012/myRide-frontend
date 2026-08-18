import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";

function ProtectedRoute({ role, element }) {
  const { user, profile, loading, authError } = useAuth();

  if (loading) {
    return <div className="auth-loading">Loading…</div>;
  }

  if (authError) {
    return (
      <div className="auth-loading">
        <div style={{ textAlign: "center", maxWidth: 420, width: "100%", padding: 24 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, color: "#102542" }}>Authentication issue</h2>
          <p style={{ margin: 0, color: "#6d7a99", lineHeight: 1.6 }}>{authError}</p>
          <p style={{ margin: 12, color: "#6d7a99", lineHeight: 1.6 }}>Try logging out and logging in again. If the problem persists, check Firestore rules.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && profile?.role !== role) {
    const fallback = {
      rider: "/rider",
      driver: "/driver",
      partners: "/partners",
      admin: "/admin",
    }[profile?.role] || "/login";
    return <Navigate to={fallback} replace />;
  }

  return element;
}

export default ProtectedRoute;
