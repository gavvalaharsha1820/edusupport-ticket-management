export default function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone.toLowerCase().replaceAll(" ", "-")}`}>{children}</span>;
}
