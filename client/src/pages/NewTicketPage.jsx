import { useState } from "react";
import { api } from "../lib/api";
import { CATEGORIES, PRIORITY } from "../constants/options";

export default function NewTicketPage({ onDone }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Fees", priority: "Medium" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/tickets", { method: "POST", body: JSON.stringify(form) });
      onDone();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-intro">
        <span className="eyebrow">NEW REQUEST</span>
        <h2>Tell us what you need help with</h2>
        <p>Include enough detail for the support team to resolve your request quickly.</p>
      </div>

      <section className="panel form-panel">
        <form onSubmit={submit}>
          <label>Request title
            <input required maxLength="120" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Attendance is incorrect for DBMS" />
          </label>

          <div className="form-grid">
            <label>Category
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label>Priority
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITY.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <label>Description
            <textarea required maxLength="2000" rows="9" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue, relevant dates and what you need…" />
          </label>

          {error && <div className="alert error">{error}</div>}

          <div className="form-actions">
            <button className="button secondary" type="button" onClick={onDone}>Cancel</button>
            <button className="button primary" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
