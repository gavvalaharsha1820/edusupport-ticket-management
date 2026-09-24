import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PRIORITY, STATUS } from "../constants/options";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import TicketDetailModal from "../components/TicketDetailModal";

function timeLeft(date) {
  const ms = new Date(date) - new Date();
  if (ms <= 0) return "Overdue";
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  return days ? `${days}d ${hours % 24}h` : hours ? `${hours}h` : `${Math.floor(ms / 60000)}m`;
}

export default function TicketsPage({ user, refresh, onChanged }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
      const data = await api(`/tickets?${params.toString()}`);
      setTickets(data.tickets);
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => { load(); }, [refresh]);
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [filters.status, filters.priority, filters.search]);

  return (
    <div className="page-content">
      <div className="page-intro">
        <div>
          <span className="eyebrow">WORK QUEUE</span>
          <h2>{user.role === "student" ? "Your requests" : "All support requests"}</h2>
          <p>Search, filter and open a ticket to view its full history.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-field"><span>⌕</span><input placeholder="Search ticket number or title…" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} /></div>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUS.map(value => <option key={value}>{value}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priorities</option>
          {PRIORITY.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="panel table-panel">
        {tickets.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th><th>Owner</th><th>SLA</th></tr></thead>
              <tbody>
                {tickets.map(ticket => {
                  const overdue = new Date(ticket.slaDueAt) < new Date() && !["Resolved", "Closed"].includes(ticket.status);
                  return (
                    <tr key={ticket._id} onClick={() => setSelected(ticket._id)}>
                      <td><strong>{ticket.ticketNo}</strong><span>{ticket.title}</span></td>
                      <td>{ticket.category}</td>
                      <td><Badge tone={ticket.priority}>{ticket.priority}</Badge></td>
                      <td><Badge tone={ticket.status}>{ticket.status}</Badge></td>
                      <td>{ticket.assignedTo?.name || <span className="muted">Unassigned</span>}</td>
                      <td className={overdue ? "danger-text" : ""}>{["Resolved", "Closed"].includes(ticket.status) ? "Completed" : timeLeft(ticket.slaDueAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No tickets found" text="Try changing your filters or create a new request." />}
      </section>

      {selected && (
        <TicketDetailModal
          id={selected}
          user={user}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); onChanged(); }}
        />
      )}
    </div>
  );
}
