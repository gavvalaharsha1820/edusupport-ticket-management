export default function EmptyState({ title = "Nothing here yet", text = "" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">○</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}
