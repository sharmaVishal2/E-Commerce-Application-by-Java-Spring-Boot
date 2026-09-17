const ICONS = { error: "⚠", empty: "○", default: "…" };

const StatePanel = ({ title, description, actionLabel, onAction, tone = "default", compact = false }) => (
  <div className={`state-panel${tone === "error" ? " state-panel--error" : ""}${compact ? " state-panel--compact" : ""}`}>
    <div className="state-panel__icon" aria-hidden="true">{ICONS[tone] ?? ICONS.default}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && (
        <button className="btn btn--secondary btn--sm" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

export default StatePanel;
