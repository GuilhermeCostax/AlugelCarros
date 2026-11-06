import { STATUS } from '../utils/status';

export default function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{STATUS[status] ?? status}</span>;
}
