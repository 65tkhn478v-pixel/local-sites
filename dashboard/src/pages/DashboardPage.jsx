import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import ProspectsTable from "../components/ProspectsTable";
import { getProspects, getStats, resetToDemoData } from "../data/store";

export default function DashboardPage() {
  const [version, setVersion] = useState(0);

  const prospects = useMemo(() => getProspects(), [version]);
  const stats = useMemo(() => getStats(), [version]);

  function handleReset() {
    if (
      window.confirm(
        "Réinitialiser les données de démonstration ? Les prospects créés localement seront perdus."
      )
    ) {
      resetToDemoData();
      setVersion((v) => v + 1);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Vue d'ensemble de vos prospects.</p>
        </div>
        <Link to="/prospects/new" className="btn btn-primary">
          + Nouveau prospect
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Prospects" value={stats.total} />
        <StatCard label="Sites générés" value={stats.sitesGenerated} />
        <StatCard label="À contacter" value={stats.toContact} />
      </div>

      <div className="section-header">
        <h2>Tous les prospects</h2>
        <button className="btn btn-ghost btn-small" onClick={handleReset}>
          Réinitialiser les données de démo
        </button>
      </div>

      <ProspectsTable prospects={prospects} />
    </div>
  );
}
