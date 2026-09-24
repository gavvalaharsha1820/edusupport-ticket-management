import { useEffect, useState } from "react";
import { api } from "../lib/api";
import MetricCard from "../components/MetricCard";
import EmptyState from "../components/EmptyState";

export default function DashboardPage({ user, refresh, onOpenTickets }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api("/tickets/dashboard")
      .then(setData)
      .catch(error => setError(error.message));
  }, [refresh]);

  if (error) return <div className="page-content"><div className="alert error">{error}</div></div>;
  if (!data) return <div className="page-content"><div className="loading-box"><div className="spinner" />Loading dashboard…</div></div>;

  const maxCategory = Math.max(...data.byCategory.map(item => item.count), 1);
  const maxPriority = Math.max(...data.byPriority.map(item => item.count), 1);

  return (
    <div className="page-content">
      <section className="welcome-card">
        <div>
          <span className="eyebrow">GOOD TO SEE YOU</span>
          <h2>{user.name}</h2>
          <p>
            {user.role === "student"
              ? "Track your requests, reply to support and stay on top of deadlines."
              : "Monitor workload, ownership and SLA performance from one place."}
          </p>
        </div>
        <button className="button primary" onClick={onOpenTickets}>Open ticket workspace →</button>
      </section>

      <div className="metric-grid">
        <MetricCard label="Total tickets" value={data.metrics.total} hint="All requests" icon="◈" />
        <MetricCard label="Active" value={data.metrics.active} hint="Needs attention" icon="◷" />
        <MetricCard label="Resolved" value={data.metrics.resolved} hint="Successfully resolved" icon="✓" />
        <MetricCard label="SLA overdue" value={data.metrics.overdue} hint="Past due time" icon="!" danger />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading"><div><h3>Tickets by category</h3><span>Where requests are coming from</span></div></div>
          {data.byCategory.length ? (
            <div className="bar-list">
              {data.byCategory.map(item => (
                <div className="bar-item" key={item._id}>
                  <div><strong>{item._id}</strong><span>{item.count}</span></div>
                  <div className="bar-track"><i style={{ width: `${item.count / maxCategory * 100}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No tickets yet" text="Ticket activity will appear here." />}
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h3>Priority mix</h3><span>Current workload by urgency</span></div></div>
          {data.byPriority.length ? (
            <div className="bar-list">
              {data.byPriority.map(item => (
                <div className="bar-item" key={item._id}>
                  <div><strong>{item._id}</strong><span>{item.count}</span></div>
                  <div className="bar-track"><i style={{ width: `${item.count / maxPriority * 100}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No tickets yet" text="Priority distribution will appear here." />}
        </section>
      </div>

      <section className="insight-card">
        <div className="insight-symbol">↗</div>
        <div>
          <h3>How the support workflow works</h3>
          <p>Students raise requests. Support staff assign ownership, update status and manage SLA ageing. Resolved tickets retain a complete activity history for review.</p>
        </div>
      </section>
    </div>
  );
}
