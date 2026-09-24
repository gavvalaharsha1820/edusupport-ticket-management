import Logo from "./Logo";

const navItems = [
  { key: "dashboard", label: "Overview", icon: "⌂" },
  { key: "tickets", label: "Tickets", icon: "▣" }
];

export function AppShell({ user, page, onNavigate, onLogout, children }) {
  const items = [...navItems];

  if (user.role === "student") {
    items.push({ key: "new", label: "New request", icon: "+" });
  }
  if (user.role === "admin") {
    items.push({ key: "users", label: "Users", icon: "♙" });
  }

  const pageTitle = {
    dashboard: "Overview",
    tickets: "Ticket workspace",
    new: "Create support request",
    users: "User management"
  }[page] || "Overview";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {items.map(item => (
            <button
              key={item.key}
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-mini">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role} · {user.department || "Campus"}</span>
            </div>
          </div>
          <button className="signout-button" onClick={onLogout}>↪ Sign out</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">EduSupport / {pageTitle}</span>
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-user">
            <span className="role-pill">{user.role}</span>
            <div className="avatar avatar-small">{user.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
