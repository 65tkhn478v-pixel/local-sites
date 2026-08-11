import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function ProspectsTable({ prospects }) {
  if (prospects.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucun prospect pour le moment.</p>
        <Link to="/prospects/new" className="btn btn-primary">
          + Nouveau prospect
        </Link>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="prospects-table">
        <thead>
          <tr>
            <th>Commerce</th>
            <th>Activité</th>
            <th>Ville</th>
            <th>Statut</th>
            <th>Site</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/prospects/${p.id}`} className="table-link">
                  {p.name}
                </Link>
              </td>
              <td>{p.activity}</td>
              <td>{p.city}</td>
              <td>
                <StatusBadge status={p.status} />
              </td>
              <td>
                <span
                  className={
                    "site-status " +
                    (p.siteStatus === "Généré" ? "is-generated" : "")
                  }
                >
                  {p.siteStatus}
                </span>
              </td>
              <td className="table-actions">
                <Link to={`/prospects/${p.id}`} className="btn btn-ghost btn-small">
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
