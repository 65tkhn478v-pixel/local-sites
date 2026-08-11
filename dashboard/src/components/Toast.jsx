export default function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Fermer">
        ×
      </button>
    </div>
  );
}
