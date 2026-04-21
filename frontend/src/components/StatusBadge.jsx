export function StatusBadge({ status }) {
  const map = {
    ACTIVE:    { label: "Active",    cls: "badge-active" },
    AT_RISK:   { label: "At Risk",   cls: "badge-at_risk" },
    COMPLETED: { label: "Completed", cls: "badge-completed" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`badge ${cls}`} style={{ padding: "4px 10px", borderRadius: "6px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginRight: 6 }} />
      {label}
    </span>
  );
}

export function StageBadge({ stage }) {
  const map = {
    PLANTED:   { label: "Planted",   cls: "badge-planted" },
    GROWING:   { label: "Growing",   cls: "badge-growing" },
    READY:     { label: "Ready",     cls: "badge-ready" },
    HARVESTED: { label: "Harvested", cls: "badge-harvested" },
  };
  const { label, cls } = map[stage] ?? { label: stage, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}
