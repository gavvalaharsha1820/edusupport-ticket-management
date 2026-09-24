export default function MetricCard({ label, value, hint, icon, danger = false }) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span className="metric-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <strong className={danger && value > 0 ? "danger-text" : ""}>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
