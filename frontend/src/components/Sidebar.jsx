import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminNav = () => (
  <>
    <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
      Dashboard
    </NavLink>
    <NavLink to="/admin/fields" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
      All Fields
    </NavLink>
  </>
);

const AgentNav = () => (
  <NavLink to="/agent" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    My Fields
  </NavLink>
);

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5">
          <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-0 5-4 9-10 9z" />
        </svg>
        <div className="sidebar-logo-text">shambalako</div>
      </div>

      <nav className="sidebar-nav">
        {user?.role === "ADMIN" ? <AdminNav /> : <AgentNav />}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-callout">
          <div style={{ fontWeight: 800, marginBottom: 4, color: "var(--lime)" }}>Need help?</div>
          <div style={{ opacity: 0.8, lineHeight: 1.4 }}>Ready to contact field experts near you?</div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" style={{ color: "var(--white)", fontSize: "14px", fontWeight: 700 }}>{user?.name}</div>
            <div className="sidebar-user-role" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{user?.role?.toLowerCase()}</div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Log out"
            style={{
              color: "#fb7185",
              background: "rgba(251, 113, 133, 0.1)",
              padding: "8px 12px",
              borderRadius: "10px",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "12px"
            }}
          >
            <span style={{ opacity: 0.9 }}>Logout</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
