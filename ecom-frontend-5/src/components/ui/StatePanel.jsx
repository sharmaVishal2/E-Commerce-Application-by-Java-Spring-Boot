const toneClassMap = {
  default: "",
  error: "state-panel--error",
  empty: "state-panel--empty",
};

const StatePanel = ({
  title,
  description,
  actionLabel,
  onAction,
  tone = "default",
  compact = false,
}) => {
  return (
    <div className={`state-panel ${toneClassMap[tone] || ""} ${compact ? "state-panel--compact" : ""}`}>
      <div className="state-panel__icon" aria-hidden="true">
        {tone === "error" ? "!" : tone === "empty" ? "0" : "..."}
      </div>
      <div className="state-panel__content">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {actionLabel ? (
          <button className="button button--secondary" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default StatePanel;
