import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProspect, updateProspect } from "../data/store";
import { PROSPECT_STATUSES } from "../data/statuses";
import { requestSiteGeneration } from "../data/generateSite";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";

const INFO_ROWS = [
  { key: "activity", label: "Activité" },
  { key: "city", label: "Ville" },
  { key: "address", label: "Adresse" },
  { key: "phone", label: "Téléphone" },
  { key: "currentWebsite", label: "Site actuel" },
  { key: "instagram", label: "Instagram" },
];

export default function ProspectDetailPage() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState("");
  const [generating, setGenerating] = useState(false);

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

  async function handleGenerateSite() {
    setGenerating(true);
    try {
      const result = await requestSiteGeneration(prospect);
      updateProspect(id, {
        siteStatus: "Généré",
        siteUrl: result.siteUrl,
        slug: result.slug,
        sitePath: result.sitePath,
        dataPath: result.dataPath,
      });
      setVersion((v) => v + 1);
      setToast(`Site généré dans ${result.prospectDir}/`);
    } catch (err) {
      setToast(err.message || "Échec de la génération du site.");
    } finally {
      setGenerating(false);
    }
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
            <h2>Informations</h2>
            <dl className="info-list">
              {INFO_ROWS.map(({ key, label }) => (
                <div className="info-row" key={key}>
                  <dt>{label}</dt>
                  <dd>{prospect[key] || "—"}</dd>
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
              <button
                className="btn btn-primary btn-block"
                onClick={handleGenerateSite}
                disabled={generating}
              >
                {generating ? "Génération…" : "Générer le site"}
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
                {prospect.slug
                  ? "Site généré localement dans prospects/" +
                    prospect.slug +
                    "/ — servi automatiquement par ce serveur de dev (npm run dev)."
                  : "Aperçu disponible uniquement si le repository entier est servi en statique depuis sa racine (voir README principal)."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
