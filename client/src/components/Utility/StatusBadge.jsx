import "./badges.css";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`badge badge--status badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

export default StatusBadge;
