export default function Logo({ compact = false, light = false }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <div className="logo-mark">E</div>
      {!compact && (
        <div>
          <strong>EduSupport</strong>
          <span>Campus support platform</span>
        </div>
      )}
    </div>
  );
}
