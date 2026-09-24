import { useState } from "react";
import { api } from "../lib/api";
import { DEPARTMENTS, ROLES } from "../constants/options";
import Logo from "../components/Logo";

const demo = {
  student: ["student@edusupport.com", "Student@123"],
  staff: ["staff@edusupport.com", "Staff@123"],
  admin: ["admin@edusupport.com", "Admin@123"]
};

export default function LoginPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: demo.student[0], password: demo.student[1], department: "CSE" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function changeRole(nextRole) {
    setRole(nextRole);
    setError("");
    if (mode === "login") {
      setForm(current => ({ ...current, email: demo[nextRole][0], password: demo[nextRole][1] }));
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    if (nextMode === "register") {
      setRole("student");
      setForm({ name: "", email: "", password: "", department: "CSE" });
    } else {
      setForm({ name: "", email: demo.student[0], password: demo.student[1], department: "CSE" });
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password, role }
        : { name: form.name, email: form.email, password: form.password, department: form.department };

      const result = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });

      localStorage.setItem("token", result.token);
      onAuthenticated(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <Logo light />
        <div className="auth-hero">
          <span className="eyebrow">SMART CAMPUS SUPPORT</span>
          <h1>Every request.<br /><em>Handled with clarity.</em></h1>
          <p>
            A focused support workspace connecting students, support teams and
            administrators from the first request to resolution.
          </p>
          <div className="feature-stack">
            {[
              ["01", "Structured ticket lifecycle", "Assignment, status, SLA and resolution tracking"],
              ["02", "Role-based workspace", "Separate workflows for students, staff and administrators"],
              ["03", "Operational visibility", "Ageing, priorities and workload in one dashboard"]
            ].map(item => (
              <div className="feature-row" key={item[0]}>
                <span>{item[0]}</span>
                <div><strong>{item[1]}</strong><small>{item[2]}</small></div>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-brand-footer">Product Engineering Assignment · 2026</div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>

          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Register</button>
          </div>

          <div className="auth-heading">
            <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "STUDENT REGISTRATION"}</span>
            <h2>{mode === "login" ? "Sign in to your workspace" : "Create your student account"}</h2>
            <p>
              {mode === "login"
                ? "Choose your workspace role and continue."
                : "Registration is available for students. Staff and admin accounts are created by an administrator."}
            </p>
          </div>

          {mode === "login" && (
            <div className="role-selector">
              {ROLES.map(item => (
                <button
                  key={item.value}
                  className={role === item.value ? "selected" : ""}
                  onClick={() => changeRole(item.value)}
                >
                  <span className="role-icon">{item.icon}</span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <>
                <label>Full name
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </label>
                <label>Department
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.slice(0, 5).map(value => <option key={value}>{value}</option>)}
                  </select>
                </label>
              </>
            )}

            <label>Email address
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" />
            </label>

            <label>Password
              <input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            </label>

            {error && <div className="alert error">{error}</div>}

            <button className="button primary button-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? `Continue as ${role}` : "Create student account"}
            </button>
          </form>

          {mode === "login" && (
            <div className="demo-access">
              <div>
                <strong>Demo access</strong>
                <span>Preloaded accounts for your product walkthrough.</span>
              </div>
              {ROLES.map(item => (
                <button key={item.value} onClick={() => changeRole(item.value)}>
                  <span>{item.label}</span>
                  <code>{demo[item.value][0]}</code>
                </button>
              ))}
            </div>
          )}

          <p className="auth-note">
            {mode === "login" ? "New student?" : "Already registered?"}{" "}
            <button onClick={() => changeMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Create an account" : "Back to sign in"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
