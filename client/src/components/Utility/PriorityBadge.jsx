import "./badges.css";

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const PriorityBadge = ({ priority }) => {
  return (
    <span className={`badge badge--priority badge--priority-${priority}`}>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
};

export default PriorityBadge;
