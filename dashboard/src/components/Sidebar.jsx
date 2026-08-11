import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-badge">LS</span>
        <div>
          <div className="sidebar-brand-title">Local Sites</div>
          <div className="sidebar-brand-subtitle">Dashboard</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/prospects/new"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          + Nouveau prospect
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>V1 — données locales</p>
      </div>
    </aside>
  );
}
