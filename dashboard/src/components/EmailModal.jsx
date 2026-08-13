// Modale d'affichage de l'email de prospection généré (voir
// ../data/generateEmail.js). Purement locale : aucune donnée n'est envoyée,
// sauvegardée sur le prospect ou persistée — fermer la modale ne conserve
// rien.

export default function EmailModal({ email, onClose, onCopied }) {
  if (!email) return null;

  async function handleCopy() {
    const text = `Objet : ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(text);
      onCopied();
    } catch {
      // Presse-papiers indisponible (permissions navigateur) : l'utilisateur
      // peut toujours sélectionner le texte manuellement dans la modale.
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Email de prospection</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="modal-field">
          <label>Objet</label>
          <div className="modal-value">{email.subject}</div>
        </div>

        <div className="modal-field">
          <label>Contenu</label>
          <div className="modal-value modal-value-body">{email.body}</div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
          <button className="btn btn-primary" onClick={handleCopy}>
            Copier
          </button>
        </div>
      </div>
    </div>
  );
}
