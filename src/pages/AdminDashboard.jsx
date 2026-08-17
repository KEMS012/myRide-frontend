import "../styles/riderDashboard.css";
import "../styles/adminDashboard.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";
import {
  FaGaugeHigh,
  FaUsers,
  FaMotorcycle,
  FaRoute,
  FaHandshake,
  FaSackDollar,
  FaIdCard,
  FaChartLine,
  FaBell,
  FaMagnifyingGlass,
  FaArrowRight,
  FaCircleCheck,
  FaXmark,
  FaCheck,
  FaBan,
  FaPlus,
  FaTrash,
  FaRightFromBracket,
  FaGear,
  FaEye,
  FaPen,
  FaShieldHalved,
  FaEyeSlash,
  FaUser,
  FaRotateRight,
} from "react-icons/fa6";
import {
  getPartners,
  getUsers,
  docRef,
  deleteDoc,
  updateDoc,
  seedInitialData,
  onUsersSnapshot,
  onRidesSnapshot,
  onPartnersSnapshot,
  updateRideStatus,
  onNotificationsSnapshot,
  createNotification,
  markNotificationRead,
} from "../services/firestore";

const normalizeStatus = (status) => {
  const value = String(status || "").trim().toLowerCase();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
};

const navItems = [
  { id: "overview", label: "Dashboard", icon: <FaGaugeHigh /> },
  { id: "users", label: "Users", icon: <FaUsers /> },
  { id: "drivers", label: "Drivers", icon: <FaMotorcycle /> },
  { id: "rides", label: "Rides", icon: <FaRoute /> },
  { id: "partners", label: "Partners", icon: <FaHandshake /> },
  { id: "verification", label: "Verification", icon: <FaIdCard /> },
  { id: "reports", label: "Reports", icon: <FaChartLine /> },
  { id: "settings", label: "Settings", icon: <FaGear /> },
];

function AdminDashboard() {
  const { profile: authProfile, updateProfile, uploadAvatar, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [rides, setRides] = useState([]);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [editTarget, setEditTarget] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [revealKyc, setRevealKyc] = useState(false);
  const [avatar, setAvatar] = useState(
    authProfile?.avatar || "https://randomuser.me/api/portraits/men/15.jpg"
  );
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const refreshAdminData = async () => {
    try {
      setRefreshing(true);
      const freshUsers = await getUsers();
      const normalizedItems = freshUsers.map((item) => ({
        ...item,
        role: String(item.role || "").trim() || "rider",
        status: item.status || "Active",
      }));
      setUsers(normalizedItems);
      setDrivers(normalizedItems.filter((x) => String(x.role || "").trim().toLowerCase() === "driver"));
      setVerifications(
        normalizedItems
          .filter((x) => normalizeStatus(x.status) === "Pending")
          .map((x) => ({ id: x.id, ...x }))
      );
      showToast("Users refreshed from Firebase.");
    } catch (err) {
      console.error("refreshAdminData error:", err);
      showToast("Failed to refresh admin data.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let unsubUsers, unsubRides, unsubPartners, unsubNotifs;

    async function setup() {
      try {
        setLoadingData(true);
        setLoadError("");

        const syncUsers = (items) => {
          const normalizedItems = items.map((item) => ({
            ...item,
            role: String(item.role || "").trim() || "rider",
            status: item.status || "Active",
          }));
          setUsers(normalizedItems);
          setDrivers(normalizedItems.filter((x) => String(x.role || "").trim().toLowerCase() === "driver"));
          setVerifications(
            normalizedItems
              .filter((x) => normalizeStatus(x.status) === "Pending")
              .map((x) => ({ id: x.id, ...x }))
          );
        };

        unsubUsers = onUsersSnapshot((items) => {
          syncUsers(items);
        });

        try {
          const fallbackUsers = await getUsers();
          syncUsers(fallbackUsers);
        } catch (fallbackErr) {
          console.warn("Admin user fallback fetch failed:", fallbackErr);
        }

        unsubRides = onRidesSnapshot((items) => {
          setRides(items);
        });

        unsubPartners = onPartnersSnapshot((items) => {
          setPartners(items);
        });

        unsubNotifs = onNotificationsSnapshot("admin", (items) => {
          setNotifications(items);
          setUnreadNotifCount(items.filter((n) => !n.read).length);
        });

      } catch (err) {
        console.error("Admin real-time setup error:", err);
        setLoadError(err?.message || "Failed to load admin data.");
        showToast("Failed to load admin data. Check Firestore rules.");
      } finally {
        setLoadingData(false);
      }
    }

    setup();

    return () => {
      unsubUsers?.();
      unsubRides?.();
      unsubPartners?.();
      unsubNotifs?.();
    };
  }, []);

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
    uploadAvatar(file)
      .then((url) => {
        if (url) setAvatar(url);
        updateProfile({ avatar: url });
        showToast("Profile picture updated.");
      })
      .catch((err) => {
        console.error("Avatar upload error:", err);
        showToast("Failed to update profile picture.");
      });
    e.target.value = "";
  };

  const cycleStatus = async (list, setList, id, nextMap, msg) => {
    const item = list.find((x) => x.id === id);
    if (!item) return;
    const currentStatus = normalizeStatus(item.status);
    const next = nextMap[currentStatus] || currentStatus;
    const colName = list === partners ? "partners" : "users";
    try {
      await updateDoc(docRef(colName, id), { status: next });
      setList((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
      showToast(msg);
    } catch (err) {
      console.error("cycleStatus error:", err);
      showToast("Failed to update status.");
    }
  };

  const removeItem = async (list, setList, id, label) => {
    const colName = list === partners ? "partners" : "users";
    try {
      await deleteDoc(docRef(colName, id));
      setList((prev) => prev.filter((item) => item.id !== id));
      showToast(`${label} removed.`);
    } catch (err) {
      console.error("removeItem error:", err);
      showToast(`Failed to remove ${label.toLowerCase()}.`);
    }
  };

  const verify = async (id) => {
    try {
      await updateDoc(docRef("users", id), { status: "active" });
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: "Verified" } : v))
      );
      showToast("Driver verified successfully.");
    } catch (err) {
      console.error("verify error:", err);
      showToast("Failed to verify driver.");
    }
  };

  const handleRideStatusChange = async (rideId, status) => {
    try {
      await updateRideStatus(rideId, status);
      showToast(`Ride marked as ${status}.`);
    } catch (err) {
      console.error("handleRideStatusChange error:", err);
      showToast("Failed to update ride status.");
    }
  };

  const removeRide = async (rideId) => {
    try {
      await deleteDoc(docRef("rides", rideId));
      setRides((prev) => prev.filter((ride) => ride.id !== rideId));
      showToast("Ride removed from the platform.");
    } catch (err) {
      console.error("removeRide error:", err);
      showToast("Failed to remove ride.");
    }
  };

  const updateRecord = async (kind, updated) => {
    const collectionName = kind === "partner" ? "partners" : "users";
    try {
      const { __kind, id, ...safeUpdates } = updated;
      const normalizedUpdates = {
        ...safeUpdates,
        role: String(safeUpdates.role || "").trim() || "rider",
        status: safeUpdates.status || "Active",
      };
      await updateDoc(docRef(collectionName, id), normalizedUpdates);
      const setList = kind === "user" ? setUsers : kind === "driver" ? setDrivers : setPartners;
      setList((prev) => prev.map((item) => (item.id === id ? { ...item, ...normalizedUpdates } : item)));
      setEditTarget(null);
      showToast(`${kind} record updated.`);
    } catch (err) {
      console.error("updateRecord error:", err);
      showToast("Failed to update record.");
    }
  };

  const openEdit = (record, kind) => {
    setEditTarget({ ...record, __kind: kind });
  };

  const sampleNotifications = [
    { id: 1, text: "2 driver verifications awaiting review.", time: "10m ago", unread: true },
    { id: 2, text: "Grace Thompson was suspended.", time: "1h ago", unread: true },
    { id: 3, text: "Daily revenue hit ₦284k.", time: "3h ago", unread: false },
  ];

  useEffect(() => {
    let cancelled = false;

    async function ensurePartnersSeeded() {
      try {
        const existing = await getPartners();
        if (cancelled || existing.length > 0) return;
        await seedInitialData();
        const fresh = await getPartners();
        if (!cancelled) setPartners(fresh);
      } catch (err) {
        console.warn("Partner seed skipped:", err);
      }
    }

    ensurePartnersSeeded();

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const safeText = (value) => String(value || "").toLowerCase();

  const monthlyRides = rides.filter((r) => {
    const now = new Date();
    const rideDate = r.createdAt?.toDate ? r.createdAt.toDate() : null;
    if (!rideDate) return false;
    return rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear();
  }).length;

  const totalRevenue = rides
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number(r.fare?.replace(/[^0-9]/g, "") || 0), 0);

  const reportStats = [
    { label: "Total Users", value: String(users.length), icon: <FaUsers />, tone: "blue" },
    { label: "Monthly Rides", value: String(monthlyRides), icon: <FaRoute />, tone: "green" },
    { label: "Monthly Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: <FaSackDollar />, tone: "gold" },
    { label: "Partners", value: String(partners.length), icon: <FaHandshake />, tone: "purple" },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const status = normalizeStatus(u.status);
      const query = safeText(search);
      return (
        statusFilter === "All" || status === normalizeStatus(statusFilter)
      ) &&
        (
          safeText(u.name).includes(query) ||
          safeText(u.email).includes(query) ||
          safeText(u.phone).includes(query) ||
          safeText(u.role).includes(query) ||
          safeText(u.address).includes(query) ||
          safeText(u.town).includes(query) ||
          safeText(u.area).includes(query)
        );
    });
  }, [search, statusFilter, users]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const status = normalizeStatus(d.status);
      const query = safeText(search);
      return (
        statusFilter === "All" || status === normalizeStatus(statusFilter)
      ) &&
        (
          safeText(d.name).includes(query) ||
          safeText(d.email).includes(query) ||
          safeText(d.phone).includes(query) ||
          safeText(d.vehicle).includes(query) ||
          safeText(d.area).includes(query) ||
          safeText(d.role).includes(query)
        );
    });
  }, [search, statusFilter, drivers]);

  if (loadingData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading admin dashboard…</h2>
          <p>This may take a few seconds while we fetch your platform data.</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <h2>Couldn't load the dashboard</h2>
          <p>{loadError}</p>
          <button className="qb-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <p>Welcome back, {authProfile?.name?.split(" ")[0] || "Admin"}. Control center for all MyRyde activities</p>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder="Search users, drivers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value && (active === "users" || active === "drivers"))
                    return;
                  if (e.target.value) setActive("users");
                }}
              />
            </div>

            <button className="icon-btn" onClick={() => refreshAdminData()} disabled={refreshing} title="Refresh users">
              <FaRotateRight />
            </button>

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

            <div className="topbar-user" onClick={() => goTo("settings")}>
              <img src={avatar} alt="User" />
              <div className="user-info">
                <strong>{authProfile?.name?.split(" ")[0] || "Admin"}</strong>
                <small>Super Admin</small>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {active === "overview" && (
            <>
              <section className="admin-banner">
                <div className="admin-banner-text">
                  <span className="pill"><FaShieldHalved /> Platform Control</span>
                  <h2>MyRyde operations overview</h2>
                  <p>Monitor users, drivers, rides and revenue across Ogbomoso in real time.</p>
                </div>
                <button className="qb-btn light" onClick={() => goTo("verification")}>
                  Review Verifications <FaArrowRight />
                </button>
              </section>

              <section className="stats-row">
                {[
                  { label: "Total Users", value: String(users.length), icon: <FaUsers />, tone: "blue" },
                  { label: "Active Drivers", value: String(drivers.filter((d) => d.status === "active").length), icon: <FaMotorcycle />, tone: "green" },
                  { label: "Rides Today", value: String(rides.filter((r) => r.status === "completed").length), icon: <FaRoute />, tone: "purple" },
                  { label: "Revenue Today", value: "₦0", icon: <FaSackDollar />, tone: "gold" },
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
                    <h3>Recent Rides</h3>
                    <button className="link-btn" onClick={() => goTo("rides")}>All rides</button>
                  </div>
                  <div className="trips-table">
                    <div className="trips-table-head">
                      <span>Ref</span><span>Passenger</span><span>Driver</span><span>Fare</span><span>Status</span>
                    </div>
                    {rides.slice(0, 4).map((t) => (
                      <div className="trips-table-row" key={t.id}>
                        <span className="trip-id">{t.id}</span>
                        <span>{t.riderName || t.rider || "—"}</span>
                        <span>{t.driverName || t.driver || "—"}</span>
                        <span className="fare">{t.rideFare || t.fare || "—"}</span>
                        <span><em className={`status ${statusClass(t.status)}`}>{t.status}</em></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="side-column">
                  <div className="panel">
                    <div className="panel-head">
                      <h3>Pending Actions</h3>
                      <button className="link-btn" onClick={() => goTo("verification")}>Review</button>
                    </div>
                    <div className="action-list">
                      <div className="action-item">
                        <span className="action-count">{verifications.filter((v) => normalizeStatus(v.status) === "Pending").length}</span>
                        <div><strong>Driver verifications</strong><small>Awaiting review</small></div>
                      </div>
                      <div className="action-item">
                        <span className="action-count">{users.filter((u) => normalizeStatus(u.status) === "Pending").length}</span>
                        <div><strong>User approvals</strong><small>New sign-ups</small></div>
                      </div>
                      <div className="action-item">
                        <span className="action-count">{drivers.filter((d) => normalizeStatus(d.status) === "Pending").length}</span>
                        <div><strong>Driver approvals</strong><small>Onboarding</small></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {active === "users" && (
            <CrudTable
              title="Users"
              filtered={filteredUsers}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              search={search}
              setSearch={setSearch}
              cols={["Name", "Email", "Phone", "Role", "Address", "Status", "Actions"]}
              renderRow={(u) => (
                <>
                  <span className="trip-id">{u.name}</span>
                  <span>{u.email}</span>
                  <span>{u.phone}</span>
                  <span>{u.role}</span>
                  <span>{u.address || u.town || "—"}</span>
                  <span><em className={`status ${statusClass(u.status)}`}>{u.status}</em></span>
                </>
              )}
              onApprove={(id) =>
                cycleStatus(users, setUsers, id, { Pending: "Active" }, "User approved.")
              }
              onSuspend={(id) =>
                cycleStatus(
                  users, setUsers, id,
                  { Active: "Suspended", Suspended: "Active", Pending: "Active" },
                  "User status updated."
                )
              }
              onDelete={(id) => removeItem(users, setUsers, id, "User")}
              onEdit={(item) => openEdit(item, "user")}
              onView={(item) => setViewUser(item)}
            />
          )}

          {active === "drivers" && (
            <CrudTable
              title="Drivers"
              filtered={filteredDrivers}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              search={search}
              setSearch={setSearch}
              cols={["Name", "Vehicle", "Area", "Rating", "Status", "Actions"]}
              renderRow={(d) => (
                <>
                  <span className="trip-id">{d.name}</span>
                  <span>{d.vehicle}</span>
                  <span>{d.area}</span>
                  <span>{d.rating}</span>
                  <span><em className={`status ${statusClass(d.status)}`}>{d.status}</em></span>
                </>
              )}
              onApprove={(id) =>
                cycleStatus(drivers, setDrivers, id, { Pending: "Active" }, "Driver approved.")
              }
              onSuspend={(id) =>
                cycleStatus(
                  drivers, setDrivers, id,
                  { Active: "Suspended", Suspended: "Active", Pending: "Active" },
                  "Driver status updated."
                )
              }
              onDelete={(id) => removeItem(drivers, setDrivers, id, "Driver")}
              onEdit={(item) => openEdit(item, "driver")}
              onView={(item) => { setViewDriver(item); setRevealKyc(false); }}
            />
          )}

          {active === "rides" && (
            <section className="panel">
              <div className="panel-head"><h3>All Rides</h3></div>
              <div className="trips-table">
                <div className="trips-table-head">
                  <span>Ref</span><span>Rider</span><span>Driver</span><span>Fare</span><span>Status</span>
                </div>
                {rides.map((t) => (
                  <div className="trips-table-row" key={t.id}>
                    <span className="trip-id">{t.id}</span>
                    <span>{t.riderName || t.rider || "—"}</span>
                    <span>{t.driverName || t.driver || "—"}</span>
                    <span className="fare">{t.rideFare || t.fare || "—"}</span>
                    <span><em className={`status ${statusClass(t.status)}`}>{t.status}</em></span>
                    <span className="row-actions">
                      {t.status !== "accepted" && (
                        <button className="ghost-btn" onClick={() => handleRideStatusChange(t.id, "accepted")}>Accept</button>
                      )}
                      {t.status !== "rejected" && (
                        <button className="ghost-btn danger" onClick={() => handleRideStatusChange(t.id, "rejected")}>Reject</button>
                      )}
                      {t.status !== "completed" && (
                        <button className="qb-btn small" onClick={() => handleRideStatusChange(t.id, "completed")}>Complete</button>
                      )}
                      <button className="ghost-btn danger" onClick={() => removeRide(t.id)}><FaTrash /></button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "partners" && (
            <section className="panel">
              <div className="panel-head">
                <h3>Partner Organizations</h3>
                <button className="qb-btn small" onClick={() => showToast("Add partner form opened.")}>
                  <FaPlus /> Add Partner
                </button>
              </div>
              <div className="trips-table">
                <div className="trips-table-head">
                  <span>Name</span><span>Type</span><span>Area</span><span>Status</span><span>Actions</span>
                </div>
                {partners.map((p) => (
                  <div className="trips-table-row" key={p.id}>
                    <span className="trip-id">{p.name}</span>
                    <span>{p.type}</span>
                    <span>{p.area}</span>
                    <span><em className={`status ${statusClass(p.status)}`}>{p.status}</em></span>
                    <span className="row-actions">
                      <button className="ghost-btn" onClick={() => showToast(`Viewing ${p.name}.`)}><FaEye /></button>
                      <button className="ghost-btn danger" onClick={() => removeItem(partners, setPartners, p.id, "Partner")}><FaTrash /></button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "verification" && (
            <section className="panel">
              <div className="panel-head"><h3>Driver Verification Queue</h3></div>
              <div className="trips-table">
                <div className="trips-table-head">
                  <span>Name</span><span>Documents</span><span>Area</span><span>Status</span><span>Actions</span>
                </div>
                {verifications.map((v) => (
                  <div className="trips-table-row" key={v.id}>
                    <span className="trip-id">{v.name}</span>
                    <span>{v.doc}</span>
                    <span>{v.area}</span>
                    <span><em className={`status ${statusClass(v.status)}`}>{v.status}</em></span>
                    <span className="row-actions">
                      <button className="ghost-btn" onClick={() => showToast(`Reviewing ${v.name}.`)}><FaEye /></button>
                      {normalizeStatus(v.status) === "Pending" ? (
                        <button className="ghost-btn" onClick={() => verify(v.id)}><FaCheck /> Verify</button>
                      ) : (
                        <span className="muted">Done</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "reports" && (
            <section>
              <div className="stats-row">
                {reportStats.map((s) => (
                  <div className={`stat-box ${s.tone}`} key={s.label}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-text">
                      <h3>{s.value}</h3>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel" style={{ marginTop: "26px" }}>
                <div className="panel-head"><h3>Activity (last 7 days)</h3></div>
                <div className="bar-chart tall">
                  {[60, 72, 55, 88, 96, 70, 64].map((v, i) => (
                    <div className="bar-col" key={i}>
                      <div className="bar" style={{ height: `${v}%` }}></div>
                      <small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {active === "settings" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="profile-head">
                  <div className="avatar-upload">
                    <img src={avatar} alt="User" />
                    <button type="button" className="avatar-edit" onClick={() => fileInputRef.current?.click()} title="Change photo">
                      <FaPen />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} hidden />
                  </div>
                  <div>
                    <h3>System Administrator</h3>
                    <p className="muted">Super Admin · MyRyde HQ</p>
                  </div>
                  <button className="ghost-btn" onClick={() => showToast("Edit mode enabled.")}>
                    <FaPen /> Edit
                  </button>
                </div>
                <form className="book-form" onSubmit={(e) => { e.preventDefault(); showToast("Settings saved."); }}>
                  <label>Platform Name</label>
                  <input type="text" defaultValue="MyRyde" />
                  <label>Support Email</label>
                  <input type="email" defaultValue="support@myryde.com" />
                  <label>Commission Rate (%)</label>
                  <input type="text" defaultValue="20" />
                  <Toggle label="Auto-verify NIN" defaultOn onToggle={showToast} />
                  <Toggle label="Maintenance mode" onToggle={showToast} />
                  <button className="qb-btn full" type="submit"><FaCircleCheck /> Save Changes</button>
                </form>
                <div className="settings-danger">
                  <button className="ghost-btn danger" onClick={() => showToast("Password reset link sent.")}>Change Password</button>
                  <Link to="/login" className="ghost-btn danger"><FaRightFromBracket /> Log Out</Link>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditTarget(null)}><FaXmark /></button>
            <h2>Edit {editTarget.__kind === "user" ? "User" : "Driver"}</h2>
            <p className="muted">Update profile details, role, status, and supporting account information.</p>
            <form
              className="book-form"
              onSubmit={(e) => {
                e.preventDefault();
                const { __kind, ...updated } = editTarget;
                updateRecord(__kind, updated);
              }}
            >
              <label>Role</label>
              <select
                value={editTarget.role || "rider"}
                onChange={(e) => setEditTarget({ ...editTarget, role: e.target.value })}
              >
                <option value="rider">Passenger</option>
                <option value="driver">Driver</option>
                <option value="partners">Partner</option>
                <option value="admin">Admin</option>
              </select>

              <label>Status</label>
              <select
                value={editTarget.status || "Active"}
                onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>

              <label>Full Name</label>
              <input
                type="text"
                value={editTarget.name || ""}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
              />

              <label>Phone Number</label>
              <input
                type="text"
                value={editTarget.phone || ""}
                onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })}
              />

              <label>Email</label>
              <input
                type="email"
                value={editTarget.email || ""}
                onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
              />

              <label>Address</label>
              <input
                type="text"
                value={editTarget.address || ""}
                onChange={(e) => setEditTarget({ ...editTarget, address: e.target.value })}
              />

              <label>Town</label>
              <input
                type="text"
                value={editTarget.town || ""}
                onChange={(e) => setEditTarget({ ...editTarget, town: e.target.value })}
              />

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={Boolean(editTarget.locationSharingEnabled)}
                  onChange={(e) => setEditTarget({ ...editTarget, locationSharingEnabled: e.target.checked })}
                />
                Enable location sharing
              </label>

              {editTarget.__kind === "driver" && (
                <>
                  <label>Vehicle</label>
                  <input
                    type="text"
                    value={editTarget.vehicle || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, vehicle: e.target.value })}
                  />
                  <label>License Number</label>
                  <input
                    type="text"
                    value={editTarget.license || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, license: e.target.value })}
                  />
                  <label>NIN</label>
                  <input
                    type="text"
                    value={editTarget.nin || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, nin: e.target.value })}
                  />
                  <label>BVN</label>
                  <input
                    type="text"
                    value={editTarget.bvn || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, bvn: e.target.value })}
                  />
                  <label>Next of Kin</label>
                  <input
                    type="text"
                    value={editTarget.nextOfKin || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, nextOfKin: e.target.value })}
                  />
                  <label>Experience</label>
                  <input
                    type="text"
                    value={editTarget.experience || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, experience: e.target.value })}
                  />
                  <label>Previous Workplace</label>
                  <input
                    type="text"
                    value={editTarget.previousWorkplace || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, previousWorkplace: e.target.value })}
                  />
                </>
              )}

              <label>Notes / Extra Info</label>
              <textarea
                rows="3"
                value={editTarget.notes || ""}
                onChange={(e) => setEditTarget({ ...editTarget, notes: e.target.value })}
              />

              <button className="qb-btn full" type="submit">
                <FaCircleCheck /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {viewDriver && (
        <div className="modal-overlay" onClick={() => setViewDriver(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewDriver(null)}><FaXmark /></button>
            <div className="modal-icon"><FaIdCard /></div>
            <h2>{viewDriver.name}</h2>
            <p className="muted">{viewDriver.vehicle} · {viewDriver.area} · ⭐ {viewDriver.rating}</p>

            <div className="kyc-note">
              <FaShieldHalved /> Sensitive identity data — visible to admin for tracking & verification only.
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <small>Role</small>
                <span>{viewDriver.role || "driver"}</span>
              </div>
              <div className="kyc-field">
                <small>Status</small>
                <span className={`status ${statusClass(viewDriver.status)}`}>{viewDriver.status}</span>
              </div>
              <div className="kyc-field">
                <small>Email</small>
                <span>{viewDriver.email || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Phone</small>
                <span>{viewDriver.phone || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Address</small>
                <span>{viewDriver.address || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Town</small>
                <span>{viewDriver.town || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>NIN</small>
                <span>{revealKyc ? viewDriver.nin : mask(viewDriver.nin)}</span>
              </div>
              <div className="kyc-field">
                <small>BVN</small>
                <span>{revealKyc ? viewDriver.bvn : mask(viewDriver.bvn)}</span>
              </div>
              <div className="kyc-field">
                <small>License</small>
                <span>{viewDriver.license || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Next of Kin</small>
                <span>{viewDriver.nextOfKin || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Experience</small>
                <span>{viewDriver.experience || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Previous Workplace</small>
                <span>{viewDriver.previousWorkplace || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Notes</small>
                <span>{viewDriver.notes || "—"}</span>
              </div>
            </div>

            <button className="kyc-toggle" onClick={() => setRevealKyc((v) => !v)}>
              {revealKyc ? <><FaEyeSlash /> Hide Identity Numbers</> : <><FaEye /> Reveal NIN / BVN</>}
            </button>

            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => { openEdit(viewDriver, "driver"); setViewDriver(null); }}>
                <FaPen /> Edit Record
              </button>
              <button className="ghost-btn danger" onClick={() => removeItem(drivers, setDrivers, viewDriver.id, "Driver")}>
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewUser(null)}><FaXmark /></button>
            <div className="modal-icon"><FaUser /></div>
            <h2>{viewUser.name}</h2>
             <p className="muted">{viewUser.role === "rider" ? "Passenger" : viewUser.role} · {viewUser.status}</p>

            <div className="kyc-grid">
              <div className="kyc-field">
                <small>Role</small>
                 <span>{viewUser.role === "rider" ? "Passenger" : viewUser.role || "Passenger"}</span>
              </div>
              <div className="kyc-field">
                <small>Status</small>
                <span>{viewUser.status || "Active"}</span>
              </div>
              <div className="kyc-field">
                <small>Email</small>
                <span>{viewUser.email || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Phone</small>
                <span>{viewUser.phone || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Address</small>
                <span>{viewUser.address || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Town</small>
                <span>{viewUser.town || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Location Sharing</small>
                <span>{viewUser.locationSharingEnabled ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="kyc-field">
                <small>Vehicle</small>
                <span>{viewUser.vehicle || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>License</small>
                <span>{viewUser.license || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>NIN</small>
                <span>{viewUser.nin || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>BVN</small>
                <span>{viewUser.bvn || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Next of Kin</small>
                <span>{viewUser.nextOfKin || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Experience</small>
                <span>{viewUser.experience || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Previous Workplace</small>
                <span>{viewUser.previousWorkplace || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Notes</small>
                <span>{viewUser.notes || "—"}</span>
              </div>
              <div className="kyc-field">
                <small>Last Location</small>
                <span>
                  {viewUser.lastLocation
                    ? `${viewUser.lastLocation.latitude.toFixed(4)}, ${viewUser.lastLocation.longitude.toFixed(4)}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="qb-btn" onClick={() => { openEdit(viewUser, "user"); setViewUser(null); }}>
                <FaPen /> Edit
              </button>
              <button className="ghost-btn" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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

function mask(value) {
  if (!value) return "—";
  const str = String(value);
  if (str.length <= 4) return str;
  return `${str.slice(0, 3)} •••• ${str.slice(-3)}`;
}

function statusClass(status) {
  switch (status) {
    case "Active":
    case "Verified":
    case "Completed":
      return "done";
    case "Suspended":
    case "Cancelled":
    case "Pending":
      return "warn";
    default:
      return "warn";
  }
}

function CrudTable({
  title, filtered, statusFilter, setStatusFilter,
  search, setSearch, cols, renderRow, onApprove, onSuspend, onDelete, onEdit, onView,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <div className="table-controls">
          <input
            type="text"
            className="table-search"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-tabs">
            {["All", "Active", "Pending", "Suspended"].map((f) => (
              <button
                key={f}
                className={`filter-tab ${statusFilter === f ? "active" : ""}`}
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="trips-table">
        <div className="trips-table-head">
          {cols.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="empty-note">No {title.toLowerCase()} match your filters.</p>
        )}
        {filtered.map((item) => (
          <div className="trips-table-row" key={item.id}>
            {renderRow(item)}
            <span className="row-actions">
              {onView && (
                <button className="ghost-btn" onClick={() => onView(item)}>
                  <FaEye /> View
                </button>
              )}
              {normalizeStatus(item.status) === "Pending" && (
                <button className="ghost-btn" onClick={() => onApprove(item.id)}><FaCheck /> Approve</button>
              )}
              <button className="ghost-btn" onClick={() => onSuspend(item.id)}>
                {normalizeStatus(item.status) === "Suspended" ? <FaCheck /> : <FaBan />}
                {normalizeStatus(item.status) === "Suspended" ? "Unsuspend" : "Suspend"}
              </button>
              {onEdit && (
                <button className="ghost-btn" onClick={() => onEdit(item)}>
                  <FaPen /> Edit
                </button>
              )}
              <button className="ghost-btn danger" onClick={() => onDelete(item.id)}><FaTrash /></button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Toggle({ label, defaultOn = false, onToggle }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        className={`switch ${on ? "on" : ""}`}
        onClick={() => { setOn((v) => !v); onToggle(`${label} turned ${!on ? "on" : "off"}.`); }}
      >
        <span className="knob"></span>
      </button>
    </div>
  );
}

export default AdminDashboard;