import { useState } from "react";
import Logo from "./Logo";
import { api } from "../lib/api";

const navItems = [
  {
    key: "dashboard",
    label: "Overview",
    icon: "⌂"
  },
  {
    key: "tickets",
    label: "Tickets",
    icon: "▣"
  }
];

export function AppShell({
  user,
  page,
  onNavigate,
  onLogout,
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [displayUser, setDisplayUser] = useState(user);

  const [editProfileOpen, setEditProfileOpen] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);

  const [name, setName] = useState(user.name || "");
  const [department, setDepartment] = useState(
    user.department || ""
  );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const items = [...navItems];

  if (user.role === "student") {
    items.push({
      key: "new",
      label: "New request",
      icon: "+"
    });
  }

  if (user.role === "admin") {
    items.push({
      key: "users",
      label: "Users",
      icon: "♙"
    });
  }

  const pageTitle = {
    dashboard: "Overview",
    tickets: "Ticket workspace",
    new: "Create support request",
    users: "User management"
  }[page] || "Overview";

  function navigate(key) {
    onNavigate(key);
    setMenuOpen(false);
  }

  function openProfile() {
    setProfileOpen(true);
    setEditProfileOpen(false);
    setPasswordOpen(false);
    setMessage("");
    setError("");
  }

  function closeProfile() {
    setProfileOpen(false);
    setEditProfileOpen(false);
    setPasswordOpen(false);
    setMessage("");
    setError("");
  }

  async function saveProfile() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await api("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          department
        })
      });

      setDisplayUser(result.user);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) {
      setError(
        "Please enter your current and new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await api(
        "/auth/password",
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      localStorage.setItem(
        "token",
        result.token
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Password changed successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">

      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <Logo />

        <div className="mobile-header-actions">

          <button
            className="mobile-icon-button"
            onClick={openProfile}
            aria-label="Open profile"
          >
            {displayUser.name?.[0]?.toUpperCase()}
          </button>

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Open navigation"
          >
            ☰
          </button>

        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          menuOpen ? "mobile-open" : ""
        }`}
      >
        <Logo />

        <div className="workspace-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">

          {items.map(item => (
            <button
              key={item.key}
              className={`nav-item ${
                page === item.key
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.key)
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

        </nav>

        <div className="sidebar-footer">

          <button
            className="profile-mini profile-button"
            onClick={openProfile}
          >
            <div className="avatar">
              {displayUser.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <strong>
                {displayUser.name}
              </strong>

              <span>
                {displayUser.role} ·{" "}
                {displayUser.department ||
                  "Campus"}
              </span>
            </div>
          </button>

          <button
            className="signout-button"
            onClick={onLogout}
          >
            ↪ Sign out
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="main-area">

        <header className="topbar">

          <div>
            <span className="breadcrumb">
              EduSupport / {pageTitle}
            </span>

            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-user">

            <span className="role-pill">
              {displayUser.role}
            </span>

            <button
              className="avatar avatar-small avatar-button"
              onClick={openProfile}
              title="Profile"
            >
              {displayUser.name?.[0]?.toUpperCase()}
            </button>

          </div>

        </header>

        {children}

      </main>

      {/* PROFILE MODAL */}
      {profileOpen && (
        <div
          className="profile-overlay"
          onClick={closeProfile}
        >
          <div
            className="profile-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="profile-modal-header">
              <div>
                <span className="modal-eyebrow">
                  ACCOUNT
                </span>

                <h2>My profile</h2>
              </div>

              <button
                className="close-button"
                onClick={closeProfile}
              >
                ×
              </button>
            </div>

            <div className="profile-summary">

              <div className="avatar avatar-large">
                {displayUser.name?.[0]?.toUpperCase()}
              </div>

              <div>
                <strong>
                  {displayUser.name}
                </strong>

                <span>
                  {displayUser.email}
                </span>

                <span>
                  {displayUser.role}
                </span>
              </div>

            </div>

            <div className="profile-actions">

              <button
                className="profile-action"
                onClick={() => {
                  setEditProfileOpen(true);
                  setPasswordOpen(false);
                  setError("");
                  setMessage("");
                }}
              >
                <span>👤</span>

                <div>
                  <strong>
                    Edit profile
                  </strong>

                  <small>
                    Update your name and department
                  </small>
                </div>
              </button>

              <button
                className="profile-action"
                onClick={() => {
                  setPasswordOpen(true);
                  setEditProfileOpen(false);
                  setError("");
                  setMessage("");
                }}
              >
                <span>🔐</span>

                <div>
                  <strong>
                    Change password
                  </strong>

                  <small>
                    Update your account password
                  </small>
                </div>
              </button>

            </div>

            {/* EDIT PROFILE */}
            {editProfileOpen && (
              <div className="profile-form">

                <h3>Edit profile</h3>

                <label>
                  Full name

                  <input
                    value={name}
                    onChange={e =>
                      setName(e.target.value)
                    }
                    maxLength={80}
                  />
                </label>

                <label>
                  Department

                  <input
                    value={department}
                    onChange={e =>
                      setDepartment(
                        e.target.value
                      )
                    }
                    placeholder="Department"
                  />
                </label>

                <button
                  className="button primary"
                  disabled={saving}
                  onClick={saveProfile}
                >
                  {saving
                    ? "Saving..."
                    : "Save changes"}
                </button>

              </div>
            )}

            {/* CHANGE PASSWORD */}
            {passwordOpen && (
              <div className="profile-form">

                <h3>Change password</h3>

                <label>
                  Current password

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                  />
                </label>

                <label>
                  New password

                  <input
                    type="password"
                    value={newPassword}
                    onChange={e =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  Confirm new password

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />
                </label>

                <small className="password-help">
                  Use at least 8 characters.
                </small>

                <button
                  className="button primary"
                  disabled={saving}
                  onClick={changePassword}
                >
                  {saving
                    ? "Changing..."
                    : "Change password"}
                </button>

              </div>
            )}

            {message && (
              <div className="alert success">
                {message}
              </div>
            )}

            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            {/* MOBILE/PROFILE SIGN OUT */}
            <button
              className="profile-signout"
              onClick={onLogout}
            >
              ↪ Sign out
            </button>

          </div>
        </div>
      )}

    </div>
  );
}