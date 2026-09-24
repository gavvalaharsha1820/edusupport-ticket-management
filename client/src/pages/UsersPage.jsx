import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { DEPARTMENTS } from "../constants/options";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", department: "CSE" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await api("/users");
      setUsers(data.users);
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/users", { method: "POST", body: JSON.stringify(form) });
      setShow(false);
      setForm({ name: "", email: "", password: "", role: "student", department: "CSE" });
      await load();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id) {
    try {
      await api(`/users/${id}/toggle`, { method: "PATCH" });
      await load();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="page-content">
      <div className="page-intro page-intro-row">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h2>Users & access</h2>
          <p>Create and manage student, staff and administrator accounts.</p>
        </div>
        <button className="button primary" onClick={() => { setError(""); setShow(true); }}>+ Add user</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="panel table-panel">
        {users.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Created</th><th /></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><div className="user-cell"><div className="mini-avatar">{user.name?.[0]}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td>
                    <td><Badge tone={user.role}>{user.role}</Badge></td>
                    <td>{user.department || "—"}</td>
                    <td><Badge tone={user.active ? "resolved" : "closed"}>{user.active ? "Active" : "Inactive"}</Badge></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><button className="table-action" onClick={() => toggle(user.id)}>{user.active ? "Deactivate" : "Activate"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No users found" text="Create your first account." />}
      </section>

      {show && (
        <Modal
          title="Add user"
          subtitle="Create a staff, student or admin account"
          onClose={() => setShow(false)}
        >
          <form onSubmit={create}>
            <label>Full name
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </label>
            <label>Email
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@college.edu" />
            </label>
            <div className="form-grid">
              <label>Role
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label>Department
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>
            <label>Temporary password
              <input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            </label>
            {error && <div className="alert error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setShow(false)}>Cancel</button>
              <button className="button primary" disabled={busy}>{busy ? "Creating…" : "Create user"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
