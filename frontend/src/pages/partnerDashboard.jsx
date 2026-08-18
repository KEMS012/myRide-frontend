import "../styles/riderDashboard.css";
import "../styles/partnerDashboard.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";
import { getUserMessage } from "../utils/errors";
import {
  FaGaugeHigh,
  FaChurch,
  FaSchool,
  FaUsers,
  FaRoute,
  FaSackDollar,
  FaCalendarCheck,
  FaBell,
  FaMagnifyingGlass,
  FaArrowRight,
  FaCircleCheck,
  FaXmark,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaRightFromBracket,
  FaLocationDot,
  FaUser,
  FaGear,
  FaHandshake,
  FaStar,
} from "react-icons/fa6";
import {
  getPartners,
  getPrograms,
  createProgram,
  getPartners as getPartnerDocs,
  deleteDoc,
  updateDoc,
  docRef,
  getRides,
  onPartnersSnapshot,
  onProgramsSnapshot,
  onRidesSnapshot,
} from "../services/firestore";

const navItems = [
  { id: "overview", label: "Dashboard", icon: <FaGaugeHigh /> },
  { id: "churches", label: "Churches", icon: <FaChurch /> },
  { id: "schools", label: "Schools", icon: <FaSchool /> },
  { id: "programs", label: "Programs", icon: <FaCalendarCheck /> },
  { id: "riders", label: "Passenger Base", icon: <FaUsers /> },
  { id: "trips", label: "Trips", icon: <FaRoute /> },
  { id: "revenue", label: "Revenue", icon: <FaSackDollar /> },
  { id: "profile", label: "Profile", icon: <FaUser /> },
  { id: "settings", label: "Settings", icon: <FaGear /> },
];



function PartnerDashboard() {
  const { user, profile, updateProfile, uploadAvatar, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [partners, setPartners] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [trips, setTrips] = useState([]);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [avatar, setAvatar] = useState(
    profile?.avatar || ""
  );
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || user?.displayName || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || user?.phoneNumber || "",
    organization: profile?.organization || "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    let unsubPartners, unsubPrograms, unsubRides;
    unsubPartners = onPartnersSnapshot((items) => setPartners(items));
    unsubPrograms = onProgramsSnapshot((items) => setProgramList(items));
    unsubRides = onRidesSnapshot((items) => setTrips(items));
    return () => {
      unsubPartners?.();
      unsubPrograms?.();
      unsubRides?.();
    };
  }, []);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: profile?.name || user?.displayName || prev.name || "",
      email: profile?.email || user?.email || prev.email || "",
      phone: profile?.phone || user?.phoneNumber || prev.phone || "",
      organization: profile?.organization || prev.organization || "",
    }));
    setAvatar(profile?.avatar || user?.photoURL || "https://randomuser.me/api/portraits/women/68.jpg");
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

  const notifications = [
    { id: 1, text: "Ogbomoso Grammar School requested partnership.", time: "1h ago", unread: true },
    { id: 2, text: "Campus Commute Plan reached 620 riders.", time: "4h ago", unread: true },
    { id: 3, text: "Monthly partner payout of ₦850k processed.", time: "1d ago", unread: false },
  ];

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

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesType = typeFilter === "All" || p.type === typeFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.area.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [search, typeFilter, partners]);

  const removePartner = async (id) => {
    await deleteDoc(docRef("partners", id));
    setPartners((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast("Partner removed.");
  };

  const deactivateProgram = async (id) => {
    await updateDoc(docRef("programs", id), { status: "Paused" });
    setProgramList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paused" } : p))
    );
    showToast("Program paused.");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const churchCount = partners.filter((p) => p.type === "Church").length;
  const schoolCount = partners.filter((p) => p.type === "School").length;

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
            <p>Welcome back, {profile?.name?.split(" ")[0] || "Partner"}. Church & School partnerships across Ogbomoso</p>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder="Search partners, areas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setActive("churches");
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
                  {notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`}>
                      <p>{n.text}</p>
                      <small>{n.time}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="topbar-user" onClick={() => goTo("profile")}>
              <img src={avatar} alt="User" />
              <div className="user-info">
                <strong>{profile?.name?.split(" ")[0] || "Partner"}</strong>
                <small>Partnerships</small>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {active === "overview" && (
            <>
              <section className="partner-hero">
                <div className="hero-text">
                  <span className="pill"><FaHandshake /> Community Partnerships</span>
                  <h2>Connecting churches &amp; schools with safe rides</h2>
                  <p>
                    Manage your collaboration with {churchCount} churches and{" "}
                    {schoolCount} schools across Ogbomoso, track ridership and
                    run subsidised programs.
                  </p>
                  <button className="qb-btn" onClick={() => goTo("programs")}>
                    View Programs <FaArrowRight />
                  </button>
                </div>
                <div className="hero-stats">
                  <div className="min-stat"><strong>{churchCount}</strong><small>Churches</small></div>
                  <div className="min-stat"><strong>{schoolCount}</strong><small>Schools</small></div>
                  <div className="min-stat"><strong>{programList.filter((p) => p.status === "Live").length}</strong><small>Live Programs</small></div>
                </div>
              </section>

              <section className="stats-row">
                {[
                  { label: "Partners", value: String(partners.length), icon: <FaHandshake />, tone: "blue" },
                  { label: "Active Riders", value: String(trips.length), icon: <FaUsers />, tone: "green" },
                  { label: "Rides This Month", value: String(trips.filter((t) => { const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt || Date.now()); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length), icon: <FaRoute />, tone: "purple" },
                  { label: "Partner Revenue", value: `₦${trips.filter((t) => t.status === "completed").reduce((sum, t) => sum + Number(t.fare?.replace(/[^0-9]/g, "") || 0), 0).toLocaleString()}`, icon: <FaSackDollar />, tone: "gold" },
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
                    <h3>Recent Partner Activity</h3>
                    <button className="link-btn" onClick={() => goTo("trips")}>
                      View trips
                    </button>
                  </div>
                  <div className="trips-table">
                    <div className="trips-table-head">
                      <span>Ref</span>
                      <span>Partner</span>
                      <span>Route</span>
                      <span>Date</span>
                      <span>Fare</span>
                    </div>
                    {trips.slice(0, 4).map((t) => (
                      <div className="trips-table-row" key={t.id}>
                        <span className="trip-id">{t.id}</span>
                        <span>{t.partner}</span>
                        <span>{t.route}</span>
                        <span>{new Date(t.createdAt?.toDate?.() || t.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="fare">{t.fare}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="side-column">
                  <div className="panel programs-mini">
                    <div className="panel-head">
                      <h3>Programs</h3>
                      <button className="link-btn" onClick={() => goTo("programs")}>
                        All
                      </button>
                    </div>
                    {programList.slice(0, 3).map((p) => (
                      <div className="program-row" key={p.id}>
                        <div className="program-icon">
                          {p.partner.includes("LAUTECH") || p.partner.includes("School") ? <FaSchool /> : <FaChurch />}
                        </div>
                        <div className="program-info">
                          <strong>{p.name}</strong>
                          <small>{p.partner} · {p.riders} riders</small>
                        </div>
                        <span className={`mini-tag ${p.status === "Live" ? "live" : "draft"}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {active === "churches" && (
            <PartnerTable
              title="Church Partners"
              filter="Church"
              filtered={filteredPartners}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              search={search}
              setSearch={setSearch}
              onView={setSelected}
              onRemove={removePartner}
            />
          )}

          {active === "schools" && (
            <PartnerTable
              title="School Partners"
              filter="School"
              filtered={filteredPartners}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              search={search}
              setSearch={setSearch}
              onView={setSelected}
              onRemove={removePartner}
            />
          )}

          {active === "programs" && (
            <section className="panel">
              <div className="panel-head">
                <h3>Partner Programs</h3>
                <button className="qb-btn small" onClick={() => showToast("New program form opened.")}>
                  <FaPlus /> New Program
                </button>
              </div>
              <div className="program-grid">
                {programList.map((p) => (
                  <div className="program-card" key={p.id}>
                    <div className="program-card-head">
                      <span className={`mini-tag ${p.status === "Live" ? "live" : p.status === "Draft" ? "draft" : "paused"}`}>
                        {p.status}
                      </span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="muted">{p.partner}</p>
                    <div className="program-benefit">
                      <FaStar className="gold" /> {p.benefit}
                    </div>
                    <div className="program-foot">
                      <span><FaUsers /> {p.riders} riders</span>
                      {p.status === "Live" ? (
                        <button className="ghost-btn danger" onClick={() => deactivateProgram(p.id)}>
                          Pause
                        </button>
                      ) : (
                        <button className="ghost-btn" onClick={() => showToast(`${p.name} activated.`)}>
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "riders" && (
            <section className="stats-row">
              <div className="stat-box green"><div className="stat-icon"><FaUsers /></div><div className="stat-text"><h3>{String(trips.length)}</h3><span>Total Riders</span></div></div>
              <div className="stat-box blue"><div className="stat-icon"><FaChurch /></div><div className="stat-text"><h3>{churchCount}</h3><span>Church Riders</span></div></div>
              <div className="stat-box purple"><div className="stat-icon"><FaSchool /></div><div className="stat-text"><h3>{schoolCount}</h3><span>School Riders</span></div></div>
              <div className="stat-box gold"><div className="stat-icon"><FaStar /></div><div className="stat-text"><h3>96%</h3><span>Retention</span></div></div>
            </section>
          )}

          {active === "trips" && (
            <section className="panel">
              <div className="panel-head"><h3>Partner Trips</h3></div>
              <div className="trips-table">
                <div className="trips-table-head">
                  <span>Ref</span><span>Partner</span><span>Route</span><span>Date</span><span>Fare</span>
                </div>
                {trips.map((t) => (
                  <div className="trips-table-row" key={t.id}>
                    <span className="trip-id">{t.id}</span>
                    <span>{t.partner}</span>
                    <span>{t.route}</span>
                    <span>{t.date}</span>
                    <span className="fare">{t.fare}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "revenue" && (
            <section>
              <div className="stats-row">
                <div className="stat-box gold"><div className="stat-icon"><FaSackDollar /></div><div className="stat-text"><h3>₦{trips.filter((t) => t.status === "completed").reduce((sum, t) => sum + Number(t.fare?.replace(/[^0-9]/g, "") || 0), 0).toLocaleString()}</h3><span>This Month</span></div></div>
                <div className="stat-box green"><div className="stat-icon"><FaSackDollar /></div><div className="stat-text"><h3>₦0</h3><span>Payouts</span></div></div>
                <div className="stat-box blue"><div className="stat-icon"><FaRoute /></div><div className="stat-text"><h3>{String(trips.length)}</h3><span>Trips</span></div></div>
                <div className="stat-box purple"><div className="stat-icon"><FaHandshake /></div><div className="stat-text"><h3>{String(partners.length)}</h3><span>Partners</span></div></div>
              </div>
              <div className="panel" style={{ marginTop: "26px" }}>
                <div className="panel-head"><h3>Top Earning Partners</h3></div>
                <div className="trips-table">
                  <div className="trips-table-head"><span>Partner</span><span>Type</span><span>Riders</span><span>Rides</span><span>Revenue</span></div>
                  {[...partners].sort((a, b) => b.rides - a.rides).map((p) => (
                    <div className="trips-table-row" key={p.id}>
                      <span className="trip-id">{p.name}</span>
                      <span>{p.type}</span>
                      <span>{p.riders}</span>
                      <span>{p.rides}</span>
                      <span className="fare">₦{(p.rides * 850).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {active === "profile" && (
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
                    <h3>{profile?.name || user?.displayName || "Partner"}</h3>
                    <p className="muted">Partnerships Lead · {profile?.town || "Ogbomoso"}</p>
                  </div>
                  <button className="ghost-btn" onClick={() => showToast("Edit mode enabled.")}>
                    <FaPen /> Edit
                  </button>
                </div>
                <form className="book-form" onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await updateProfile({
                      ...profileForm,
                      name: profileForm.name || profile?.name || user?.displayName || "",
                      email: profileForm.email || profile?.email || user?.email || "",
                      phone: profileForm.phone || profile?.phone || user?.phoneNumber || "",
                    });
                      showToast("Profile saved successfully.");
                    } catch (err) {
                      showToast(getUserMessage(err, "Failed to save profile."));
                    }
                }}>
                  <label>Full Name</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  <label>Email</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  <label>Phone</label>
                  <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  <label>Organization</label>
                  <input type="text" value={profileForm.organization} onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} />
                  <button className="qb-btn full" type="submit"><FaCircleCheck /> Save Changes</button>
                </form>
              </div>
            </section>
          )}

          {active === "settings" && (
            <section className="view-narrow">
              <div className="panel">
                <div className="panel-head"><h3>Settings</h3></div>
                <Toggle label="Partner join requests" defaultOn onToggle={showToast} />
                <Toggle label="Weekly partner reports" defaultOn onToggle={showToast} />
                <Toggle label="Email alerts" onToggle={showToast} />
                <div className="settings-danger">
                  <button className="ghost-btn danger" onClick={() => showToast("Password reset link sent.")}>Change Password</button>
                  <Link to="/login" className="ghost-btn danger"><FaRightFromBracket /> Log Out</Link>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}><FaXmark /></button>
            <div className="modal-icon">
              {selected.type === "Church" ? <FaChurch /> : <FaSchool />}
            </div>
            <h2>{selected.name}</h2>
            <p className="muted">{selected.type} · {selected.area}</p>
            <div className="modal-stats">
              <div><strong>{selected.riders}</strong><small>Riders</small></div>
              <div><strong>{selected.rides}</strong><small>Rides</small></div>
              <div><strong>{selected.status}</strong><small>Status</small></div>
            </div>
            <p className="modal-contact"><FaLocationDot /> Contact: {selected.contact}</p>
            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => { showToast("Message sent to partner."); setSelected(null); }}>
                Message
              </button>
              <button className="ghost-btn danger" onClick={() => removePartner(selected.id)}>
                <FaTrash /> Remove
              </button>
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

function PartnerTable({
  title, filter, filtered, typeFilter, setTypeFilter,
  search, setSearch, onView, onRemove,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <input
          type="text"
          className="table-search"
          placeholder={`Search ${filter.toLowerCase()}...`}
          value={typeFilter === filter ? search : ""}
          onChange={(e) => { setTypeFilter(filter); setSearch(e.target.value); }}
        />
      </div>

      <div className="partner-grid">
        {filtered.map((p) => (
          <div className="partner-card" key={p.id}>
            <div className={`partner-badge ${p.type.toLowerCase()}`}>
              {p.type === "Church" ? <FaChurch /> : <FaSchool />}
            </div>
            <h3>{p.name}</h3>
            <p className="muted"><FaLocationDot /> {p.area}</p>
            <div className="partner-metrics">
              <span><FaUsers /> {p.riders}</span>
              <span><FaRoute /> {p.rides}</span>
            </div>
            <span className={`mini-tag ${p.status === "Active" ? "live" : "draft"}`}>
              {p.status}
            </span>
            <div className="partner-actions">
              <button className="ghost-btn" onClick={() => onView(p)}><FaEye /> View</button>
              <button className="ghost-btn danger" onClick={() => onRemove(p.id)}><FaTrash /></button>
            </div>
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

export default PartnerDashboard;
