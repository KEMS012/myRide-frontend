import "../styles/riderDashboard.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";
import {
  FaGaugeHigh,
  FaLocationDot,
  FaCarSide,
  FaCalendarDays,
  FaCalendarPlus,
  FaMotorcycle,
  FaTrophy,
  FaWallet,
  FaUser,
  FaGear,
  FaRightFromBracket,
  FaBell,
  FaMagnifyingGlass,
  FaArrowRight,
  FaStar,
  FaClock,
  FaBolt,
  FaCircleCheck,
  FaPlus,
  FaXmark,
  FaTrash,
  FaCheck,
  FaMedal,
  FaPen,
  FaCamera,
  FaSatelliteDish,
  FaMoon,
  FaSun,
  FaPhone,
  FaComment,
  FaCar,
  FaMotorcycle as FaBike,
} from "react-icons/fa6";
import {
  createRide,
  getSchedulesForUser,
  createSchedule,
  getFixedRidesForUser,
  createFixedRide,
  getDrivers,
  getReward,
  getUser,
  deleteDoc,
  docRef,
  updateDoc,
  setDoc,
  collection,
  addDoc,
  col,
  acceptRide,
  completeRide,
  getActiveRideForDriver,
  onRidesForUserSnapshot,
  onNotificationsSnapshot,
  createNotification,
  createInvoice,
  updateInvoiceStatus,
} from "../services/firestore";
import { generateGoogleCalendarUrl } from "../utils/calendar";
import { getUserMessage } from "../utils/errors";
import { getDynamicFare, estimateBikeFare } from "../utils/fares";
import PaymentModal from "../components/PaymentModal";

const navItems = [
  { id: "overview", label: "Dashboard", icon: <FaGaugeHigh /> },
  { id: "book", label: "Book a Ride", icon: <FaCarSide /> },
  { id: "trips", label: "My Trips", icon: <FaLocationDot /> },
  { id: "scheduled", label: "Scheduled", icon: <FaCalendarDays /> },
  { id: "fixed", label: "Fixed Rides", icon: <FaMotorcycle /> },
  { id: "drivers", label: "Available Drivers", icon: <FaCar /> },
  { id: "emergency", label: "Emergency", icon: <FaPhone /> },
  { id: "support", label: "Support", icon: <FaComment /> },
  { id: "rewards", label: "Rewards", icon: <FaTrophy /> },
  { id: "wallet", label: "Wallet", icon: <FaWallet /> },
  { id: "profile", label: "Profile", icon: <FaUser /> },
  { id: "settings", label: "Settings", icon: <FaGear /> },
];

function RiderDashboard() {
  const { user, profile, updateProfile, uploadAvatar, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tripFilter, setTripFilter] = useState("All");
  const [upcoming, setUpcoming] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [, setFixedList] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [locationSharing, setLocationSharing] = useState(!!profile?.locationSharingEnabled);
  const [locationStatus, setLocationStatus] = useState("");
  const [dataError, setDataError] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: "company", name: "MyRyde Support", phone: "+234 808 591 9225" },
  ]);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [avatar, setAvatar] = useState(
    profile?.avatar || "https://randomuser.me/api/portraits/men/45.jpg"
  );
  const [profileForm, setProfileForm] = useState(() => ({
    name: profile?.name || user?.displayName || "",
    phone: profile?.phone || user?.phoneNumber || "",
    email: profile?.email || user?.email || "",
    address: profile?.address || "",
    town: profile?.town || "",
  }));
  const [driverSearch, setDriverSearch] = useState(profile?.town || "");
  const fileInputRef = useRef(null);
  const [sampleNotifications] = useState([
    { id: 1, text: "Your driver Musa A. is 2 minutes away.", time: "5m ago", unread: true },
    { id: 2, text: "Ride completed. Rate your trip!", time: "1h ago", unread: true },
    { id: 3, text: "You earned 40 reward points", time: "3h ago", unread: false },
  ]);

    useEffect(() => {
      if (!user) return;
      let active = true;
      async function load() {
        try {
          setDataError("");
     const unsubRides = onRidesForUserSnapshot(user.uid, (items) => {
       if (active) setAllTrips(items);
     });
     const unsubNotifs = onNotificationsSnapshot(user.uid, (items) => {
       if (active) {
         setNotifications(items);
         setUnreadNotifCount(items.filter((n) => !n.read).length);
       }
     });
     const [schedules, reward, fixed] = await Promise.all([
       getSchedulesForUser(user.uid),
       getReward(user.uid),
       getFixedRidesForUser(user.uid),
     ]);
     if (active) {
       setUpcoming(schedules);
       setRewards(reward);
       setFixedList(fixed);
     }
     return () => {
       unsubRides?.();
       unsubNotifs?.();
     };
        } catch (err) {
           console.error("Passenger dashboard load error:", err);
          const msg = err?.message || "Failed to load dashboard data.";
          if (msg.toLowerCase().includes("permission")) {
            setDataError("Permission denied while loading rides or schedules. Please sign out and sign in again. If this persists, check Firestore rules.");
          } else {
            setDataError(msg);
          }
        }
     }
     const cleanup = load();
     return () => {
       active = false;
       cleanup.then((unsub) => unsub?.());
     };
   }, [user]);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("Standard Ride");
  const [when, setWhen] = useState("now");
  const [scheduledDatetime, setScheduledDatetime] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const askConfirm = (message, onConfirm) => {
    setConfirm({ message, onConfirm });
  };

  const handleConfirm = () => {
    if (!confirm) return;
    confirm.onConfirm?.();
    setConfirm(null);
  };

  const handleLocationToggle = async () => {
    if (!locationSharing) {
      if (!navigator.geolocation) {
        setLocationStatus("Geolocation not supported.");
        showToast("Geolocation not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: new Date().toISOString(),
          };
          await updateDoc(docRef("users", user.uid), { locationSharingEnabled: true, lastLocation: coords });
          setLocationSharing(true);
          setLocationStatus(`Shared · ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
          showToast("Location sharing enabled.");
        },
        () => {
          setLocationStatus("Permission denied or unavailable.");
          showToast("Location access denied.");
        }
      );
    } else {
      await updateDoc(docRef("users", user.uid), { locationSharingEnabled: false, lastLocation: null });
      setLocationSharing(false);
      setLocationStatus("Off");
      showToast("Location sharing disabled.");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image is too large. Max size is 5MB.");
      return;
    }

    try {
      const url = await uploadAvatar(file);
      if (url) setAvatar(url);
      showToast("Profile picture updated.");
    } catch (err) {
      showToast(getUserMessage(err, "Failed to upload profile picture."));
    }
    e.target.value = "";
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...profileForm,
        town: profileForm.town || profile?.town || "",
      });
      showToast("Profile saved successfully.");
    } catch (err) {
      showToast(getUserMessage(err, "Failed to save profile."));
    }
  };

  const handleRateDriver = async (driver, ratingValue) => {
    if (!driver?.id) return;
    const count = Number(driver.ratingCount || 0);
    const current = Number(driver.rating || 0);
    const nextCount = count + 1;
    const nextAverage = Number(((current * count + ratingValue) / nextCount).toFixed(1));

    try {
      await updateDoc(docRef("users", driver.id), {
        rating: nextAverage,
        ratingCount: nextCount,
      });
      setAvailableDrivers((prev) =>
        prev.map((item) =>
          item.id === driver.id
            ? { ...item, rating: nextAverage, ratingCount: nextCount }
            : item
        )
      );
      showToast(`Thanks for rating ${driver.name || "this driver"}.`);
    } catch (err) {
      showToast(getUserMessage(err, "Unable to submit rating right now."));
    }
  };

  const addEmergencyContact = () => {
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      showToast("Enter name and phone number.");
      return;
    }
    setEmergencyContacts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: emergencyName.trim(), phone: emergencyPhone.trim() },
    ]);
    setEmergencyName("");
    setEmergencyPhone("");
    showToast("Emergency contact added.");
  };

  const removeEmergencyContact = (id) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    showToast("Emergency contact removed.");
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      showToast("Please fill in both subject and message.");
      return;
    }
    try {
      await addDoc(col("supportTickets"), {
        userId: user.uid,
        userName: profile?.name || user?.displayName || "Anonymous",
        userEmail: profile?.email || user?.email || "",
        subject: supportSubject.trim(),
        message: supportMessage.trim(),
        status: "open",
        createdAt: new Date(),
      });
      setSupportSent(true);
      showToast("Support request submitted. We will get back to you shortly.");
      setSupportSubject("");
      setSupportMessage("");
      setTimeout(() => setSupportSent(false), 4000);
    } catch (err) {
      showToast(getUserMessage(err, "Failed to submit support request."));
    }
  };

  const handleSOS = async () => {
    if (!user) {
      showToast("You must be logged in.");
      return;
    }
    try {
      const location = pickup || profile?.town || "Location not provided";
      const contacts = emergencyContacts.map((c) => ({ name: c.name, phone: c.phone }));
      const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/emergency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ location, message: "Emergency SOS triggered from MyRyde app", contacts }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send SOS alert.");
      }
      showToast("Emergency alert sent. Admin has been notified.");
    } catch (err) {
      showToast(getUserMessage(err, "Failed to send emergency alert."));
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!pickup || !destination) {
      showToast("Please enter pickup and destination.");
      return;
    }
    if (!user) {
      showToast("You must be logged in.");
      return;
    }
    try {
      const fare = getDynamicFare(pickup, destination, rideType);
      if (when === "now") {
        const ride = await createRide({
          userId: user.uid,
          from: pickup,
          to: destination,
          type: rideType,
          riderName: profile?.name,
          rideFare: `₦${fare.toLocaleString()}`,
          paymentStatus: "pending",
          amount: fare,
        });
        const drivers = await getDrivers();
        let nearestDriver = null;
        if (drivers.length > 0) {
          const nearest = drivers[0];
          const activeRides = await getActiveRideForDriver(nearest.id);
          if (activeRides.length === 0) {
            nearestDriver = nearest;
          }
        }
        const invoice = await createInvoice(ride.id, user.uid, fare, {
          type: rideType,
          from: pickup,
          to: destination,
          driverId: nearestDriver?.id || null,
          driverName: nearestDriver?.name || null,
        });
        setPendingPayment({ ride, invoice, fare, driverId: nearestDriver?.id, driverName: nearestDriver?.name });
        showToast("Ride booked! Complete payment to confirm your booking.");
      } else {
        const dt = scheduledDatetime || new Date().toISOString();
        await createSchedule({ userId: user.uid, from: pickup, to: destination, datetime: dt, type: rideType });
        showToast(`Ride scheduled from ${pickup} to ${destination}.`);
      }
      setPickup("");
      setDestination("");
      setScheduledDatetime("");
      getSchedulesForUser(user.uid).then(setUpcoming).catch((err) => {
        console.error("Failed to refresh schedules:", err);
      });
    } catch (err) {
      showToast(err.message || "Booking failed.");
    }
  };

  const handlePaymentSuccess = async (reference) => {
    if (!pendingPayment) return;
    try {
      const { ride, invoice, driverId, driverName } = pendingPayment;
      if (driverId) {
        await acceptRide(ride.id, driverId, driverName);
        await createNotification({
          recipientId: driverId,
          recipientRole: "driver",
          bookingId: ride.id,
          title: "New Ride Booking",
          message: `${profile?.name || "A passenger"} has booked a ride from ${ride.from} to ${ride.to}.`,
          type: "new_booking",
        });
        showToast(`Ride confirmed from ${ride.from} to ${ride.to}. Driver ${driverName} assigned.`);
      }
      await updateInvoiceStatus(invoice.id, "paid");
      showToast("Payment successful! Your ride is confirmed.");
      setPendingPayment(null);
    } catch (err) {
      showToast(err.message || "Payment confirmation failed.");
    }
  };

  const goTo = (view) => {
    setActive(view);
    setNotifOpen(false);
  };

  const filteredTrips = useMemo(() => {
    return allTrips.filter((t) => {
      const matchesFilter = tripFilter === "All" || t.status === tripFilter;
      const matchesSearch =
        (t.route || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.id || "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [search, tripFilter, allTrips]);

  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    getDrivers().then(setAvailableDrivers).catch((err) => {
      console.error("Failed to load drivers:", err);
    });
  }, []);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: profile?.name || user?.displayName || prev.name || "",
      phone: profile?.phone || user?.phoneNumber || prev.phone || "",
      email: profile?.email || user?.email || prev.email || "",
      address: profile?.address || prev.address || "",
      town: profile?.town || prev.town || "",
    }));
    if (profile?.town) {
      setDriverSearch(profile.town);
    }
  }, [profile, user]);

  const handleQuickBook = () => {
    if (!pickup || !destination) {
      goTo("book");
      showToast("Fill in your pickup and destination to book.");
      return;
    }
    showToast(`Finding rides from ${pickup} to ${destination}...`);
  };

  const cancelRide = async (id) => {
    await deleteDoc(docRef("schedules", id));
    setUpcoming((prev) => prev.filter((r) => r.id !== id));
    showToast("Scheduled ride cancelled.");
  };

  const confirmCancelRide = (id) => {
    askConfirm("Cancel this scheduled ride?", async () => {
      await cancelRide(id);
    });
  };

  const handleSubscribeFixed = async (driverId) => {
    if (!user) return;
    await createFixedRide({
      userId: user.uid,
      driverId,
      plan: "Weekly",
      schedule: "Mon-Fri",
    });
    showToast("Fixed ride subscription created.");
    getFixedRidesForUser(user.uid).then(setFixedList).catch((err) => {
      console.error("Failed to refresh fixed rides:", err);
    });
  };

  const handleAddToCalendar = (ride) => {
    const start = new Date(ride.datetime || ride.time);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    window.open(
      generateGoogleCalendarUrl({
        title: `MyRyde: ${ride.from} → ${ride.to}`,
        start,
        end,
        details: ride.type,
        location: ride.from,
      }),
      "_blank"
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredDrivers = useMemo(() => {
    const term = driverSearch.trim().toLowerCase();
    if (!term) return availableDrivers;
    return availableDrivers.filter((driver) => {
      const haystack = [driver.name, driver.town, driver.area, driver.vehicle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [availableDrivers, driverSearch]);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/myryde-logo.png" alt="MyRyde" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${active === item.id ? "active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="nav-link logout" onClick={() => askConfirm("Are you sure you want to log out?", () => { logout(); navigate("/login"); })}>
          <span className="nav-icon"><FaRightFromBracket /></span>
          Logout
        </button>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-greeting">
            <h1>{navItems.find((n) => n.id === active)?.label}</h1>
            <p>Welcome back, {profile?.name?.split(" ")[0] || "Passenger"}. Here's what's happening with your rides today.</p>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder="Search trips, drivers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setActive("trips");
                }}
              />
            </div>

            <div className="notif-wrap">
              <button
                className="icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
              >
                <FaBell />
                {unreadCount > 0 && <span className="badge-dot"></span>}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-head">
                    <strong>Notifications</strong>
                    <button className="link-btn" onClick={() => setNotifOpen(false)}>
                      Close
                    </button>
                  </div>
                  {notifications.length === 0 && sampleNotifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`}>
                      <p>{n.text}</p>
                      <small>{n.time}</small>
                    </div>
                  ))}
                  {notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}>
                      <p><strong>{n.title}</strong> — {n.message}</p>
                      <small>{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : n.createdAt || ""}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="topbar-user" onClick={() => goTo("profile")}>
              <img
                src={avatar}
                alt="User"
              />
              <div className="user-info">
                <strong>{profile?.name?.split(" ")[0] || "User"}</strong>
                  <small>{profile?.role === "driver" ? "Driver" : profile?.role === "partners" ? "Partner" : profile?.role === "admin" ? "Admin" : "Passenger"}</small>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {dataError && (
            <div className="dashboard-loading">
              <div className="loading-card">
                <h2>Couldnâ€™t load rider dashboard</h2>
                <p>{dataError}</p>
                <button className="qb-btn" onClick={() => window.location.reload()}>Retry</button>
              </div>
            </div>
          )}
          {!dataError && active === "overview" && (
            <>
              <section className="quick-book">
                <div className="quick-book-text">
                  <span className="pill"><FaBolt /> Fast Booking</span>
                  <h2>Need a ride right now?</h2>
                  <p>Book a verified driver around Ogbomoso in seconds.</p>
                </div>

                <div className="quick-book-form">
                  <div className="qb-field">
                    <FaLocationDot />
                    <input
                      type="text"
                      placeholder="Pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>
                  <div className="qb-field">
                    <FaLocationDot />
                    <input
                      type="text"
                      placeholder="Destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <button className="qb-btn" onClick={handleQuickBook}>
                    Find Ride <FaArrowRight />
                  </button>
                </div>
              </section>

              <section className="stats-row">
                {[
                  { label: "Total Rides", value: String(allTrips.length), icon: <FaCarSide />, tone: "blue" },
                  { label: "This Month", value: String(allTrips.filter((t) => {
                    const d = t.createdAt?.toDate ? t.createdAt.toDate() : null;
                    if (!d) return false;
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length), icon: <FaCalendarDays />, tone: "green" },
                  { label: "Reward Points", value: rewards ? String(rewards.points) : "0", icon: <FaTrophy />, tone: "gold" },
                  { label: "Wallet Balance", value: "₦0", icon: <FaWallet />, tone: "purple" },
                ].map((s) => (
                  <div className={`stat-box ${s.tone}`} key={s.label}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-text">
                      <h3>{s.value}</h3>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </section>

              <section className="content-grid">
                <div className="panel">
                  <div className="panel-head">
                    <h3>Recent Trips</h3>
                    <button className="link-btn" onClick={() => goTo("trips")}>
                      View all
                    </button>
                  </div>

                  <div className="trips-table">
                    <div className="trips-table-head">
                      <span>Trip ID</span>
                      <span>Route</span>
                      <span>Date</span>
                      <span>Fare</span>
                      <span>Status</span>
                    </div>

                    {allTrips.slice(0, 4).map((t) => (
                      <div className="trips-table-row" key={t.id}>
                        <span className="trip-id">{t.id}</span>
                        <span>{t.route || `${t.from || ""} → ${t.to || ""}`}</span>
                        <span>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : "—"}</span>
                        <span className="fare">{t.rideFare || t.fare || "—"}</span>
                        <span>
                          <em
                            className={`status ${
                              t.status === "Completed" ? "done" : t.status === "accepted" ? "warn" : t.status === "rejected" || t.status === "cancelled" ? "cancel" : "pending"
                            }`}
                          >
                            {t.status}
                          </em>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="side-column">
                  <div className="panel">
                    <div className="panel-head">
                      <h3>Upcoming Rides</h3>
                      <button className="link-btn" onClick={() => goTo("scheduled")}>
                        Schedule
                      </button>
                    </div>

                    {upcoming.length === 0 && (
                      <p className="empty-note">No upcoming rides.</p>
                    )}

                    {upcoming.map((r) => (
                      <div className="upcoming-item" key={r.id}>
                        <div className="upcoming-icon">
                          <FaClock />
                        </div>
                        <div className="upcoming-info">
                          <strong>{r.from} → {r.to}</strong>
                          <small>{r.datetime ? new Date(r.datetime).toLocaleString() : r.time}</small>
                        </div>
                        <span className="upcoming-tag">{r.type}</span>
                        <button
                          className="ghost-btn small"
                          onClick={() => handleAddToCalendar(r)}
                        >
                          Calendar
                        </button>
                        <button
                          className="ghost-btn danger"
                          onClick={() => confirmCancelRide(r.id)}
                        >
                          <FaTrash /> Cancel
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="panel rewards-panel">
                    <div className="rewards-top">
                      <FaTrophy />
                      <div>
                        <strong>Silver Passenger</strong>
                        <small>820 / 1000 points</small>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: "82%" }}></div>
                    </div>
                    <p className="rewards-note">
                      <FaCircleCheck /> 180 points to Gold tier
                    </p>
                    <button
                      className="qb-btn small full"
                      onClick={() => goTo("rewards")}
                    >
                      View Rewards
                    </button>
                  </div>

                  <div className="panel fixed-panel">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="Driver"
                    />
                    <div className="fixed-info">
                      <strong>Musa A.</strong>
                      <small><FaStar /> 4.9 · Your Fixed Passenger</small>
                    </div>
                    <button
                      className="qb-btn small"
                      onClick={() => {
                        goTo("book");
                        showToast("Booking with Your Fixed Passenger, Musa A.");
                      }}
                    >
                      Book
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {active === "book" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head">
                  <h3>Book a Ride</h3>
                </div>

                <form className="book-form" onSubmit={handleBook}>
                  <label>Pickup Location</label>
                  <div className="form-field">
                    <FaLocationDot />
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>

                  <label>Destination</label>
                  <div className="form-field">
                    <FaLocationDot />
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>

                  <label>Ride Type</label>
                  <select
                    value={rideType}
                    onChange={(e) => setRideType(e.target.value)}
                  >
                    <option value="Standard Ride">Standard Ride — ₦1,200</option>
                    <option value="Executive Ride">Executive Ride — ₦2,500</option>
                    <option value="Fixed Passenger">Fixed Passenger — ₦800</option>
                    <option value="Bike (Okada)">Bike (Okada) — Dynamic fare</option>
                  </select>

                  {(pickup || destination) && (
                    <div style={{ background: "var(--surface-2, #f5f5f5)", borderRadius: "10px", padding: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Estimated Fare</span>
                      <strong style={{ fontSize: "1.1rem" }}>
                        ₦{rideType === "Bike (Okada)"
                          ? (() => {
                              const est = estimateBikeFare(pickup, destination);
                              return `${est.min} – ${est.max}`;
                            })()
                          : getDynamicFare(pickup, destination, rideType).toLocaleString()}
                      </strong>
                    </div>
                  )}

                  <div className="ride-choice">
                    <button
                      type="button"
                      className={`ride-option ${when === "now" ? "active" : ""}`}
                      onClick={() => setWhen("now")}
                    >
                      <FaBolt />
                      <h4>Ride Now</h4>
                      <small>Instant Booking</small>
                    </button>
                    <button
                      type="button"
                      className={`ride-option ${when === "later" ? "active" : ""}`}
                      onClick={() => setWhen("later")}
                    >
                      <FaCalendarDays />
                      <h4>Schedule</h4>
                      <small>Book Later</small>
                    </button>
                  </div>

                  {when === "later" && (
                    <>
                      <label>Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        className="dt-input"
                        value={scheduledDatetime}
                        onChange={(e) => setScheduledDatetime(e.target.value)}
                      />
                    </>
                  )}

                  <button className="qb-btn full" type="submit">
                    Find Available Ride <FaArrowRight />
                  </button>
                </form>
              </div>
            </section>
          )}

          {active === "trips" && (
            <section className="panel">
              <div className="panel-head">
                <h3>My Trips</h3>
                <div className="filter-tabs">
                  {["All", "Completed", "Cancelled"].map((f) => (
                    <button
                      key={f}
                      className={`filter-tab ${tripFilter === f ? "active" : ""}`}
                      onClick={() => setTripFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="trips-table">
                <div className="trips-table-head">
                  <span>Trip ID</span>
                  <span>Route</span>
                  <span>Date</span>
                  <span>Fare</span>
                  <span>Status</span>
                </div>

                {filteredTrips.length === 0 && (
                  <p className="empty-note">No trips match your search.</p>
                )}

                {filteredTrips.map((t) => (
                  <div className="trips-table-row" key={t.id}>
                    <span className="trip-id">{t.id}</span>
                    <span>{t.route || `${t.from || ""} → ${t.to || ""}`}</span>
                    <span>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : "—"}</span>
                    <span className="fare">{t.rideFare || t.fare || "—"}</span>
                      <span>
                        <em
                          className={`status ${
                            t.status === "Completed" ? "done" : t.status === "accepted" ? "warn" : t.status === "rejected" || t.status === "cancelled" ? "cancel" : "pending"
                          }`}
                        >
                          {t.status}
                        </em>
                      </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "scheduled" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head">
                  <h3>Scheduled Rides</h3>
                  <button className="qb-btn small" onClick={() => goTo("book")}>
                    <FaPlus /> New
                  </button>
                </div>

                {upcoming.length === 0 && (
                  <p className="empty-note">You have no scheduled rides.</p>
                )}

                {upcoming.map((r) => (
                  <div className="upcoming-item" key={r.id}>
                    <div className="upcoming-icon">
                      <FaClock />
                    </div>
                    <div className="upcoming-info">
                      <strong>{r.from} → {r.to}</strong>
                      <small>{r.datetime ? new Date(r.datetime).toLocaleString() : r.time}</small>
                    </div>
                    <span className="upcoming-tag">{r.type}</span>
                    <button
                      className="ghost-btn"
                      onClick={() => handleAddToCalendar(r)}
                      title="Add to Google Calendar"
                    >
                      <FaCalendarPlus />
                    </button>
                    <button
                      className="ghost-btn danger"
                      onClick={() => confirmCancelRide(r.id)}
                    >
                      <FaTrash /> Cancel
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "fixed" && (
            <section className="view-narrow">
              <div className="panel fixed-detail">
                <h3>Choose a Fixed Passenger</h3>
                <p className="muted">Subscribe to the same trusted driver weekly or monthly.</p>
                <div className="form-field" style={{ marginBottom: "1rem" }}>
                  <FaMagnifyingGlass />
                  <input
                    type="text"
                    placeholder="Search by area or town"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                  />
                </div>
                <div className="driver-list">
                  {filteredDrivers.length === 0 && <p className="empty-note">No verified drivers match that area yet.</p>}
                  {filteredDrivers.map((d) => (
                    <div className="driver-card" key={d.id}>
                      <img src={d.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} alt={d.name} />
                      <div>
                        <strong>{d.name}</strong>
                        <small>{d.town || "Ogbomoso"} · ⭐ {d.rating || "4.5"}</small>
                      </div>
                      <div className="driver-actions">
                        <div className="rating-row">
                          {[0, 1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`rating-pill ${Number(d.rating || 0) >= value && value > 0 ? "active" : ""}`}
                              onClick={() => handleRateDriver(d, value)}
                            >
                              {value === 0 ? "0" : <FaStar />}
                            </button>
                          ))}
                        </div>
                        <button className="qb-btn small" onClick={() => handleSubscribeFixed(d.id)}>Subscribe</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {active === "rewards" && (
            <section>
              <div className="panel rewards-panel wide">
                <div className="rewards-top">
                  <FaTrophy />
                  <div>
                    <strong>{rewards ? rewards.tier : "Bronze Passenger"}</strong>
                    <small>{rewards ? `${rewards.points} / 1000 points` : "Complete rides to earn points"}</small>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: rewards ? `${Math.min(rewards.points, 1000) / 10}%` : "0%" }}></div>
                </div>
                <p className="rewards-note">
                  <FaCircleCheck /> {rewards ? `${1000 - rewards.points} points to Gold tier` : "Start riding to earn rewards"}
                </p>
              </div>

              <div className="reward-tier-grid">
                {(["Bronze", "Silver", "Gold"]).map((t) => (
                  <div
                    key={t}
                    className={`reward-tier ${rewards && rewards.tier === t ? "current" : ""}`}
                  >
                    <FaMedal />
                    <h3>{t}</h3>
                    <h1>{rewards && rewards.tier === t ? rewards.points : (t === "Bronze" ? "0" : t === "Silver" ? "500" : "1000")}</h1>
                    <p>Points</p>
                    {rewards && rewards.tier === t && <span className="current-tag">Current</span>}
                    <button
                      className="ghost-btn"
                      onClick={() => showToast(`${t} tier reward info.`)}
                    >
                      Info
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "wallet" && (
            <section className="content-grid">
              <div className="side-column">
                <div className="panel wallet-card">
                  <FaWallet className="wallet-chip" />
                  <small>Wallet Balance</small>
                  <h2>₦0</h2>
                  <div className="wallet-actions">
                    <button className="qb-btn small" onClick={() => showToast("Top-up coming soon.")}>
                      <FaPlus /> Add Funds
                    </button>
                    <button className="ghost-btn" onClick={() => showToast("Withdrawal coming soon.")}>
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h3>Recent Activity</h3>
                </div>
                <p className="empty-note">No transactions yet.</p>
              </div>
            </section>
          )}

          {active === "profile" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="profile-head">
                  <div className="avatar-upload">
                    <img src={avatar} alt="User" />
                    <button
                      type="button"
                      className="avatar-edit"
                      onClick={() => fileInputRef.current?.click()}
                      title="Change profile picture"
                    >
                      <FaCamera />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </div>
                  <div>
                    <h3>{profile?.name || user?.displayName || "User"}</h3>
                    <p className="muted">{profile?.role === "driver" ? "Driver" : profile?.role === "partners" ? "Partner" : profile?.role === "admin" ? "Admin" : "Rider"} · {profile?.town || "Ogbomoso"}</p>
                    <button
                      type="button"
                      className="link-btn upload-link"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change photo
                    </button>
                  </div>
                  <button
                    className="ghost-btn"
                    onClick={() => showToast("Edit mode enabled.")}
                  >
                    <FaPen /> Edit
                  </button>
                </div>

                <form className="book-form" onSubmit={handleProfileSave}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />

                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />

                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />

                  <label>Home Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />

                  <label>Town / Area</label>
                  <input
                    type="text"
                    value={profileForm.town}
                    onChange={(e) => setProfileForm({ ...profileForm, town: e.target.value })}
                  />

                  <button className="qb-btn full" type="submit">
                    <FaCheck /> Save Changes
                  </button>
                </form>
              </div>
            </section>
          )}

          {active === "settings" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head">
                  <h3>Settings</h3>
                </div>

                <Toggle label="Push Notifications" defaultOn onToggle={showToast} />
                <Toggle label="Email Updates" onToggle={showToast} />
                <Toggle label="SMS Ride Alerts" defaultOn onToggle={showToast} />
                <Toggle label="Share Trip with Contacts" defaultOn onToggle={showToast} />

                <div className="location-toggle">
                  <button
                    className={`qb-btn ${locationSharing ? "" : "outline"}`}
                    onClick={handleLocationToggle}
                  >
                    <FaSatelliteDish /> {locationSharing ? "Disable Location Sharing" : "Enable Location Sharing"}
                  </button>
                  {locationStatus && <small className="location-status">{locationStatus}</small>}
                </div>

                <div className="settings-danger">
                  <button
                    className="ghost-btn danger"
                    onClick={() => showToast("Password reset link sent.")}
                  >
                    Change Password
                  </button>
                  <Link to="/login" className="ghost-btn danger">
                    <FaRightFromBracket /> Log Out
                  </Link>
                </div>
              </div>
             </section>
           )}

           {/* ================= AVAILABLE DRIVERS ================= */}
           {active === "drivers" && (
             <section className="view-narrow">
               <div className="panel">
                 <div className="panel-head">
                   <h3>Available Drivers</h3>
                   <span className="badge muted">
                     <FaCircleCheck /> {availableDrivers.length} online
                   </span>
                 </div>
                 <div className="form-field" style={{ marginBottom: "1rem" }}>
                   <FaMagnifyingGlass />
                   <input
                     type="text"
                     placeholder="Search by area or town"
                     value={driverSearch}
                     onChange={(e) => setDriverSearch(e.target.value)}
                   />
                 </div>
                 {filteredDrivers.length === 0 && (
                   <p className="empty-note">No drivers are currently available in your area.</p>
                 )}
                 <div className="driver-grid">
                   {filteredDrivers.map((driver) => (
                     <div className="driver-card" key={driver.id}>
                       <img
                         src={driver.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                         alt={driver.name}
                       />
                       <div className="driver-card-info">
                         <strong>{driver.name}</strong>
                         <small>
                           <FaLocationDot /> {driver.area || driver.town || "Ogbomoso"}
                         </small>
                         <small>
                           <FaCar /> {driver.vehicle || "Car"}
                         </small>
                         <span className={`mini-tag ${driver.status === "active" ? "live" : "draft"}`}>
                           {driver.status === "active" ? "Available" : "Busy"}
                         </span>
                       </div>
                       <div className="driver-card-actions">
                         <a
                           className="qb-btn small"
                           href={`tel:${(driver.phone || "").replace(/\s/g, "")}`}
                         >
                           <FaPhone /> Call
                         </a>
                         <button
                           className="ghost-btn"
                           onClick={() => {
                             setPickup("");
                             setDestination("");
                             goTo("book");
                             showToast(`Driver ${driver.name} selected for your ride.`);
                           }}
                         >
                           Book
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </section>
           )}

            {active === "emergency" && (
             <section className="view-narrow">
               <div className="panel">
                 <div className="panel-head">
                   <h3>Emergency</h3>
                 </div>
                 <p className="muted">Tap SOS to send an emergency alert to admin with your location and contacts.</p>

                 <button
                   className="qb-btn full sos-btn"
                   onClick={handleSOS}
                   style={{ background: "#dc2626", color: "#fff", marginBottom: "1rem" }}
                 >
                   <FaPhone /> SOS - Emergency Alert
                 </button>

                 <div className="panel-head" style={{ marginTop: "1rem" }}>
                   <h3>Emergency Contacts</h3>
                 </div>

                <div className="emergency-list">
                  {emergencyContacts.map((c) => (
                    <div className="emergency-item" key={c.id}>
                      <div>
                        <strong>{c.name}</strong>
                        <small>{c.phone}</small>
                      </div>
                      <div className="emergency-actions">
                        <a className="qb-btn small" href={`tel:${c.phone.replace(/\s/g, "")}`}>Call</a>
                        {c.id !== "company" && (
                          <button className="ghost-btn danger" onClick={() => removeEmergencyContact(c.id)}>
                            <FaTrash /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form className="book-form" onSubmit={(e) => { e.preventDefault(); addEmergencyContact(); }}>
                  <label>Contact Name</label>
                  <input type="text" placeholder="e.g. Sister, Brother" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />

                  <label>Phone Number</label>
                  <input type="tel" placeholder="+234 800 000 0000" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />

                  <button className="qb-btn full" type="submit"><FaPlus /> Add Contact</button>
                </form>
              </div>
            </section>
          )}

          {active === "support" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head">
                  <h3>Support Center</h3>
                </div>

                <div className="support-quick">
                  <a className="qb-btn" href={`tel:+2348085919225`}><FaPhone /> Call Support</a>
                  <button className="ghost-btn" onClick={() => showToast("Support email sent to support@myryde.app")}>
                    <FaComment /> Email Support
                  </button>
                </div>

                <div className="faq-list">
                  <details>
                    <summary>How do I book a ride?</summary>
                    <p>Go to Book a Ride, enter pickup and destination, choose ride type, then tap Find Available Ride.</p>
                  </details>
                  <details>
                    <summary>How do I cancel a scheduled ride?</summary>
                    <p>Open Scheduled, find the ride, and tap Cancel. Cancellation rules may apply based on timing.</p>
                  </details>
                  <details>
                    <summary>How do I earn reward points?</summary>
                    <p>Complete rides to earn points. Higher tiers unlock more rewards and perks.</p>
                  </details>
                  <details>
                    <summary>Is my payment information secure?</summary>
                    <p>Yes. Payments are processed through trusted providers and your data is protected.</p>
                  </details>
                </div>

                <form className="book-form" onSubmit={handleSupportSubmit}>
                  <label>Subject</label>
                  <input type="text" placeholder="Brief issue summary" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} />

                  <label>Message</label>
                  <textarea rows="4" placeholder="Describe your issue..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />

                  <button className="qb-btn full" type="submit"><FaCircleCheck /> Submit Request</button>
                  {supportSent && <p className="muted">Support request submitted. We will get back to you shortly.</p>}
                </form>
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="toast">
          <FaCircleCheck /> {toast}
          <button onClick={() => setToast("")}><FaXmark /></button>
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirm(null)}><FaXmark /></button>
            <h3>Confirm action</h3>
            <p className="muted">{confirm.message}</p>
            <div className="modal-actions">
              <button className="qb-btn" onClick={handleConfirm}>Yes</button>
              <button className="ghost-btn" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        open={!!pendingPayment}
        onClose={() => setPendingPayment(null)}
        onSuccess={handlePaymentSuccess}
        rideDetails={
          pendingPayment
            ? {
                email: profile?.email || user?.email || "rider@myryde.app",
                amount: pendingPayment.fare || 1200,
                type: pendingPayment.ride?.type || "Standard Ride",
                from: pendingPayment.ride?.from || "—",
                to: pendingPayment.ride?.to || "—",
              }
            : null
        }
      />
    </div>
  );
}

function Toggle({ label, defaultOn = false, onToggle }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        className={`switch ${on ? "on" : ""}`}
        onClick={() => {
          setOn((v) => !v);
          onToggle(`${label} turned ${!on ? "on" : "off"}.`);
        }}
      >
        <span className="knob"></span>
      </button>
    </div>
  );
}

export default RiderDashboard;

