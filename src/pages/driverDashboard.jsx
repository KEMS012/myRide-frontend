import "../styles/riderDashboard.css";
import "../styles/driverDashboard.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";
import {
  FaGaugeHigh,
  FaBellConcierge,
  FaLocationDot,
  FaSackDollar,
  FaCalendarDays,
  FaStar,
  FaUser,
  FaGear,
  FaRightFromBracket,
  FaBell,
  FaMagnifyingGlass,
  FaArrowRight,
  FaClock,
  FaCircleCheck,
  FaXmark,
  FaCheck,
  FaPen,
  FaCamera,
  FaCarSide,
  FaRoute,
  FaThumbsUp,
} from "react-icons/fa6";
import {
  acceptRide,
  rejectRide,
  completeRide,
  getActiveSchedules,
  deleteDoc,
  docRef,
  onRidesForDriverSnapshot,
  onAvailableRidesSnapshot,
  onUsersSnapshot,
  onNotificationsSnapshot,
  createNotification,
  markNotificationRead,
} from "../services/firestore";

const navItems = [
  { id: "overview", label: "Dashboard", icon: <FaGaugeHigh /> },
  { id: "requests", label: "Ride Requests", icon: <FaBellConcierge /> },
  { id: "trips", label: "My Trips", icon: <FaRoute /> },
  { id: "schedule", label: "Schedule", icon: <FaCalendarDays /> },
  { id: "ratings", label: "Ratings", icon: <FaStar /> },
  { id: "profile", label: "Profile", icon: <FaUser /> },
  { id: "settings", label: "Settings", icon: <FaGear /> },
];



function DriverDashboard() {
  const { user, profile, updateProfile, uploadAvatar, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tripFilter, setTripFilter] = useState("All");
  const [online, setOnline] = useState(true);
  const [requests, setRequests] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [usersWithLocation, setUsersWithLocation] = useState([]);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [avatar, setAvatar] = useState(
    profile?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
  );
  const [profileForm, setProfileForm] = useState(() => ({
    name: profile?.name || user?.displayName || "",
    phone: profile?.phone || user?.phoneNumber || "",
    email: profile?.email || user?.email || "",
    vehicle: profile?.vehicle || "",
    license: profile?.license || "",
    plateNumber: profile?.plateNumber || "",
  }));
  const fileInputRef = useRef(null);
  const [sampleNotifications] = useState([
    { id: 1, text: "New ride request from Esther A. nearby.", time: "2m ago", unread: true },
    { id: 2, text: "You received a 5-star rating from Adebayo O.", time: "45m ago", unread: true },
  ]);
  const [reviews] = useState([
    { id: 1, passenger: "Adebayo O.", stars: 5, text: "Very smooth ride and polite driver.", date: "Jul 10" },
    { id: 2, passenger: "Esther A.", stars: 5, text: "On time and safe. Highly recommend!", date: "Jul 09" },
    { id: 3, passenger: "Grace T.", stars: 4, text: "Good trip, a little late but okay.", date: "Jul 08" },
   ]);

  useEffect(() => {
    if (!user) return;
    const unsubMyTrips = onRidesForDriverSnapshot(user.uid, (items) => setMyTrips(items));
    const unsubRequests = onAvailableRidesSnapshot((items) => setRequests(items));
    const unsubUsers = onUsersSnapshot((items) => {
      setUsersWithLocation(items.filter((u) => u.locationSharingEnabled && u.area));
    });
    const unsubNotifs = onNotificationsSnapshot(user.uid, (items) => {
      setNotifications(items);
      setUnreadNotifCount(items.filter((n) => !n.read).length);
    });
    getActiveSchedules().then(setScheduled);
    return () => {
      unsubMyTrips?.();
      unsubRequests?.();
      unsubUsers?.();
      unsubNotifs?.();
    };
  }, [user]);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: profile?.name || user?.displayName || prev.name || "",
      phone: profile?.phone || user?.phoneNumber || prev.phone || "",
      email: profile?.email || user?.email || prev.email || "",
      vehicle: profile?.vehicle || prev.vehicle || "",
      license: profile?.license || prev.license || "",
      plateNumber: profile?.plateNumber || prev.plateNumber || "",
    }));
    setAvatar(profile?.avatar || user?.photoURL || "https://randomuser.me/api/portraits/men/32.jpg");
  }, [profile, user]);

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

  const goTo = (view) => {
    setActive(view);
    setNotifOpen(false);
  };

  const handleAvatarChange = (e) => {
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
    uploadAvatar(file).then((url) => {
      if (url) setAvatar(url);
      updateProfile({ avatar: url });
      showToast("Profile picture updated.");
    });
    e.target.value = "";
  };

  const toggleOnline = () => {
    setOnline((v) => !v);
    showToast(!online ? "You are now online." : "You are now offline.");
  };

  const acceptRequest = async (id) => {
    if (!user) return;
    await acceptRide(id, user.uid, profile?.name);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("Ride accepted — heading to passenger.");
  };

  const declineRequest = async (id) => {
    if (!user) return;
    await rejectRide(id, "Declined by driver");
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("Ride request declined.");
  };

  const cancelSchedule = async (id) => {
    await deleteDoc(docRef("schedules", id));
    setScheduled((prev) => prev.filter((s) => s.id !== id));
    showToast("Scheduled ride removed.");
  };

  const filteredTrips = useMemo(() => {
    return myTrips.filter((t) => {
      const matchesFilter = tripFilter === "All" || t.status === tripFilter;
      const matchesSearch =
        (t.route || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.id || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.rider || "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [search, tripFilter, myTrips]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            <p>Welcome back, Musa. Ready to hit the road?</p>
          </div>

          <div className="topbar-actions">
            <button
              className={`online-toggle ${online ? "online" : "offline"}`}
              onClick={toggleOnline}
            >
              <span className="online-dot"></span>
              {online ? "Online" : "Offline"}
            </button>

            <div className="search-box">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder="Search trips, riders..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setActive("trips");
                }}
              />
            </div>

            <div className="notif-wrap">
              <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)}>
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
              <img src={avatar} alt="User" />
              <div className="user-info">
                <strong>{profile?.name?.split(" ")[0] || "Driver"}</strong>
                <small>{profile?.role === "admin" ? "Admin" : "Driver"}</small>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {active === "overview" && (
            <>
              <section className={`status-banner ${online ? "on" : "off"}`}>
                <div className="status-text">
                  <span className="pill">
                    <span className="online-dot"></span>
                    {online ? "You're Online" : "You're Offline"}
                  </span>
                  <h2>
                    {online
                      ? "You're receiving ride requests"
                      : "Go online to start earning"}
                  </h2>
                  <p>
                    {online
                      ? "Stay near busy areas like LAUTECH and Takie for more rides."
                      : "Toggle your status to start accepting rides around Ogbomoso."}
                  </p>
                </div>
                <button className="qb-btn light" onClick={toggleOnline}>
                  {online ? "Go Offline" : "Go Online"}
                </button>
              </section>

              <section className="stats-row">
                {[
                  { label: "Today's Earnings", value: `₦${myTrips.filter((t) => t.status === "completed").reduce((sum, t) => sum + Number(t.fare?.replace(/[^0-9]/g, "") || 0), 0).toLocaleString()}`, icon: <FaSackDollar />, tone: "green" },
                  { label: "Trips Today", value: String(myTrips.filter((t) => t.status === "completed").length), icon: <FaCarSide />, tone: "blue" },
                  { label: "Rating", value: "4.9", icon: <FaStar />, tone: "gold" },
                  { label: "Acceptance Rate", value: "94%", icon: <FaThumbsUp />, tone: "purple" },
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
                    <h3>Nearby Riders</h3>
                    <span className="badge muted">Location Shared</span>
                  </div>
                  {usersWithLocation.length === 0 && (
                    <p className="empty-note">No riders sharing location right now.</p>
                  )}
                  {usersWithLocation.map((rider) => (
                    <div className="rider-location-row" key={rider.id}>
                      <div>
                        <strong>{rider.name}</strong>
                        <small>{rider.area}</small>
                        {rider.lastLocation && (
                          <small className="coords">
                            {rider.lastLocation.latitude.toFixed(4)}, {rider.lastLocation.longitude.toFixed(4)}
                          </small>
                        )}
                      </div>
                      <span className="live-dot">Live</span>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <h3>Incoming Requests</h3>
                    <button className="link-btn" onClick={() => goTo("requests")}>
                      View all
                    </button>
                  </div>

                  {!online && (
                    <p className="empty-note">You're offline. Go online to receive requests.</p>
                  )}

                  {online && requests.length === 0 && (
                    <p className="empty-note">No incoming requests right now.</p>
                  )}

                  {online &&
                    requests.slice(0, 2).map((r) => (
                      <RequestCard
                        key={r.id}
                        req={r}
                        onAccept={acceptRequest}
                        onDecline={declineRequest}
                      />
                    ))}
                </div>

                <div className="side-column">
                  <div className="panel rating-summary">
                    <FaStar className="big-star" />
                    <h2>4.9</h2>
                    <p className="muted">Based on 214 ratings</p>
                    <button className="ghost-btn" onClick={() => goTo("ratings")}>
                      View Reviews
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {active === "requests" && (
            <section className="panel">
              <div className="panel-head">
                <h3>Ride Requests</h3>
                <button
                  className={`online-toggle ${online ? "online" : "offline"}`}
                  onClick={toggleOnline}
                >
                  <span className="online-dot"></span>
                  {online ? "Online" : "Offline"}
                </button>
              </div>

              {!online && (
                <p className="empty-note">You're offline. Go online to receive requests.</p>
              )}
              {online && requests.length === 0 && (
                <p className="empty-note">No incoming requests right now.</p>
              )}
              {online &&
                requests.map((r) => (
                  <RequestCard
                    key={r.id}
                    req={r}
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                ))}
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

              <div className="trips-table driver-trips">
                <div className="trips-table-head">
                  <span>Trip ID</span>
                  <span>Passenger</span>
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
                    <span>{t.rider}</span>
                    <span>{t.route}</span>
                        <span>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : "—"}</span>
                    <span className="fare">{t.fare}</span>
                    <span>
                      <em className={`status ${t.status === "Completed" ? "done" : t.status === "accepted" ? "warn" : t.status === "rejected" ? "cancel" : "pending"}`}>
                        {t.status}
                      </em>
                      {t.status === "accepted" && (
                        <button className="ghost-btn small" style={{ marginLeft: 8 }} onClick={() => completeRide(t.id)}>
                          Complete
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "schedule" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head">
                  <h3>Upcoming Schedule</h3>
                </div>

                {scheduled.length === 0 && (
                  <p className="empty-note">No scheduled rides.</p>
                )}

                {scheduled.map((s) => (
                  <div className="upcoming-item" key={s.id}>
                    <div className="upcoming-icon"><FaClock /></div>
                    <div className="upcoming-info">
                      <strong>{s.from} → {s.to}</strong>
                      <small>{s.datetime ? new Date(s.datetime).toLocaleString() : s.time} · {s.rider}</small>
                    </div>
                    <button className="ghost-btn danger" onClick={() => cancelSchedule(s.id)}>
                      <FaXmark /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "ratings" && (
            <section className="content-grid">
              <div className="side-column">
                <div className="panel rating-summary">
                  <FaStar className="big-star" />
                  <h2>4.9</h2>
                  <p className="muted">Based on 214 ratings</p>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h3>Recent Reviews</h3>
                </div>
                {reviews.map((rv) => (
                  <div className="review-item" key={rv.id}>
                    <div className="review-top">
                      <strong>{rv.rider}</strong>
                      <span className="review-stars">
                        {Array.from({ length: rv.stars }).map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </span>
                    </div>
                    <p>{rv.text}</p>
                    <small className="muted">{rv.date}</small>
                  </div>
                ))}
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
                    <h3>{profile?.name || user?.displayName || "Driver"}</h3>
                    <p className="muted">
                      Driver · <FaStar className="gold" /> 4.9 · Verified
                    </p>
                    <button
                      type="button"
                      className="link-btn upload-link"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change photo
                    </button>
                  </div>
                  <button className="ghost-btn" onClick={() => showToast("Edit mode enabled.")}>
                    <FaPen /> Edit
                  </button>
                </div>

                <form
                  className="book-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await updateProfile({
                        ...profileForm,
                        name: profileForm.name || profile?.name || user?.displayName || "",
                        phone: profileForm.phone || profile?.phone || user?.phoneNumber || "",
                        email: profileForm.email || profile?.email || user?.email || "",
                      });
                      showToast("Profile saved successfully.");
                    } catch {
                      showToast("Failed to save profile.");
                    }
                  }}
                >
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

                  <label>Vehicle</label>
                  <input
                    type="text"
                    value={profileForm.vehicle}
                    onChange={(e) => setProfileForm({ ...profileForm, vehicle: e.target.value })}
                  />

                  <label>License Number</label>
                  <input
                    type="text"
                    value={profileForm.license}
                    onChange={(e) => setProfileForm({ ...profileForm, license: e.target.value })}
                  />

                  <label>Vehicle Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC-1234"
                    value={profileForm.plateNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, plateNumber: e.target.value })}
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

                <Toggle label="Available for Ride Requests" defaultOn onToggle={showToast} />
                <Toggle label="Auto-accept Fixed Riders" onToggle={showToast} />
                <Toggle label="Push Notifications" defaultOn onToggle={showToast} />
                <Toggle label="Sound Alerts" defaultOn onToggle={showToast} />
                <Toggle label="Share Location While Online" defaultOn onToggle={showToast} />

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
    </div>
  );
}

function RequestCard({ req, onAccept, onDecline }) {
  const riderName = req.riderName || req.rider || "Rider";
  const rideFare = req.rideFare || req.fare || "₦1,200";
  return (
    <div className="request-card">
      <div className="request-main">
        <div className="request-rider">
          <div className="rider-avatar">{riderName.charAt(0)}</div>
          <div>
            <strong>{riderName}</strong>
            <small>{req.type || "Ride request"}</small>
          </div>
        </div>
        <span className="request-fare">{rideFare}</span>
      </div>

      <div className="request-route">
        <span><FaLocationDot className="from" /> {req.from}</span>
        <FaArrowRight />
        <span><FaLocationDot className="to" /> {req.to}</span>
      </div>

      <div className="request-actions">
        <button className="ghost-btn danger" onClick={() => onDecline(req.id)}>
          <FaXmark /> Decline
        </button>
        <button className="qb-btn" onClick={() => onAccept(req.id)}>
          <FaCheck /> Accept
        </button>
      </div>
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

export default DriverDashboard;
