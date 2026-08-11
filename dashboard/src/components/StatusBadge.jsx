import { STATUS_COLORS } from "../data/statuses";

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "neutral";
  return <span className={`badge badge-${color}`}>{status}</span>;
}
