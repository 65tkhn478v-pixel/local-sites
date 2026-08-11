import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProspect, updateProspect } from "../data/store";
import { PROSPECT_STATUSES } from "../data/statuses";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";

const IDENTITY_ROWS = [
  { key: "activity", label: "Activité" },
  { key: "address", label: "Adresse" },
  { key: "city", label: "Ville" },
  { key: "phone", label: "Téléphone" },
  { key: "email", label: "Email" },
];

const ONLINE_PRESENCE_ROWS = [
  { key: "currentWebsite", label: "Site actuel" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
];

function isLikelyUrl(value) {
  return /^https?:\/\//i.test(value);
}

export default function ProspectDetailPage() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState("");

  const prospect = getProspect(id);

  if (!prospect) {
    return (
      <div className="empty-state">
        <p>Prospect introuvable.</p>
        <Link to="/" className="btn btn-primary">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  function handleStatusChange(e) {
    updateProspect(id, { status: e.target.value });
    setVersion((v) => v + 1);
  }

  function handleGenerateSite() {
    // V1 : bouton visuel uniquement, aucune génération réelle de site.
    setToast(
      "Génération de site à venir — cette action ne crée pas encore de fichiers réels."
    );
  }

  function handleGenerateEmail() {
    // V1 : bouton visuel uniquement, aucune génération réelle d'email.
    setToast("Génération d'email à venir — fonctionnalité non implémentée en V1.");
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="page-header">
        <div>
          <Link to="/" className="breadcrumb">
            ← Retour au dashboard
          </Link>
          <h1>{prospect.name}</h1>
          <p className="page-subtitle">{prospect.activity}</p>
        </div>
        <Link to={`/prospects/${id}/edit`} className="btn btn-ghost">
          Modifier
        </Link>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h2>Identité</h2>
            <dl className="info-list">
              {IDENTITY_ROWS.map(({ key, label }) => (
                <div className="info-row" key={key}>
                  <dt>{label}</dt>
                  <dd>{prospect[key] || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card">
            <h2>Présence en ligne</h2>
            <dl className="info-list">
              {ONLINE_PRESENCE_ROWS.map(({ key, label }) => (
                <div className="info-row" key={key}>
                  <dt>{label}</dt>
                  <dd>
                    {prospect[key] && isLikelyUrl(prospect[key]) ? (
                      <a href={prospect[key]} target="_blank" rel="noopener noreferrer">
                        {prospect[key]}
                      </a>
                    ) : (
                      prospect[key] || "—"
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card">
            <h2>Description</h2>
            <p className="description-text">
              {prospect.description || "Aucune description renseignée."}
            </p>
          </div>

          <div className="card">
            <h2>Services</h2>
            {prospect.services.length === 0 ? (
              <p>Aucun service renseigné.</p>
            ) : (
              <ul className="service-list">
                {prospect.services.map((service, index) => (
                  <li className="service-list-item" key={index}>
                    <div className="service-list-main">
                      <span className="service-list-name">
                        {service.name || "—"}
                      </span>
                      {service.description && (
                        <span className="service-list-description">
                          {service.description}
                        </span>
                      )}
                    </div>
                    <div className="service-list-meta">
                      {service.duration && <span>{service.duration}</span>}
                      {service.price && <span>{service.price}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>Horaires</h2>
            <table className="hours-table">
              <tbody>
                {prospect.hours.map((entry) => (
                  <tr key={entry.day}>
                    <td>{entry.day}</td>
                    <td>{entry.hours || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-side">
          <div className="card">
            <h2>Statut prospect</h2>
            <StatusBadge status={prospect.status} />
            <select
              className="status-select"
              value={prospect.status}
              onChange={handleStatusChange}
            >
              {PROSPECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h2>Notes internes</h2>
            <p className="description-text">
              {prospect.internalNotes || "Aucune note interne."}
            </p>
          </div>

          <div className="card">
            <h2>Statut du site</h2>
            <span
              className={
                "site-status " +
                (prospect.siteStatus === "Généré" ? "is-generated" : "")
              }
            >
              {prospect.siteStatus}
            </span>

            <div className="detail-actions">
              <button className="btn btn-primary btn-block" onClick={handleGenerateSite}>
                Générer le site
              </button>
              {prospect.siteStatus === "Généré" && prospect.siteUrl && (
                <a
                  className="btn btn-ghost btn-block"
                  href={prospect.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le site
                </a>
              )}
              <button className="btn btn-ghost btn-block" onClick={handleGenerateEmail}>
                Générer l'email
              </button>
            </div>
            {prospect.siteStatus === "Généré" && (
              <p className="hint-text">
                Aperçu disponible uniquement si le repository entier est servi
                en statique depuis sa racine (voir README principal).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
