import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Login from "./pages/login";
import Register from "./pages/signup";
import ForgotPassword from "./pages/forgotPassword";
import Terms from "./pages/terms";
import RiderDashboard from "./pages/riderDashboard";
import DriverDashboard from "./pages/driverDashboard";
import PartnerDashboard from "./pages/partnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import OfflineBanner from "./components/OfflineBanner";

function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/rider" element={<ProtectedRoute role="rider" element={<RiderDashboard />} />} />
        <Route path="/driver" element={<ProtectedRoute role="driver" element={<DriverDashboard />} />} />
        <Route path="/partners" element={<ProtectedRoute role="partners" element={<PartnerDashboard />} />} />
        <Route path="/admin" element={<ProtectedRoute role="admin" element={<AdminDashboard />} />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;