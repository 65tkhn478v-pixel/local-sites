// Client léger pour l'API de génération locale exposée par le serveur de
// dev Vite (voir dashboard/vite.config.js et dashboard/server/generateSite.js).
// Ne fonctionne qu'avec `npm run dev` : aucun serveur de production, aucun
// backend distant.

export async function requestSiteGeneration(prospect) {
  const response = await fetch("/api/generate-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prospect),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Échec de la génération du site (le serveur de dev tourne-t-il bien avec `npm run dev` ?)."
    );
  }

  return result;
}
