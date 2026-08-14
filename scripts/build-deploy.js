// Assemble les sites prospects générés dans deploy/ pour un futur déploiement
// Cloudflare (Pages ou équivalent) — chaque prospect devient un sous-dossier
// deploy/<slug>/ contenant une copie de prospects/<slug>/site/.
//
// Module Node pur (aucune dépendance), lancé via `npm run build:deploy`.
// Ne modifie jamais prospects/ ni templates/business/ : lecture seule côté
// source, écriture uniquement dans deploy/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROSPECTS_DIR = path.join(REPO_ROOT, "prospects");
const DEPLOY_DIR = path.join(REPO_ROOT, "deploy");

const ROBOTS_META_RE = /<meta\s+name=["']robots["'][^>]*>/i;
const ROBOTS_META_TAG = '<meta name="robots" content="noindex">';

/**
 * Injecte <meta name="robots" content="noindex"> juste après <head> si le
 * fichier n'a pas déjà de balise meta robots.
 */
function ensureNoindex(html) {
  if (ROBOTS_META_RE.test(html)) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${ROBOTS_META_TAG}`);
  }
  // Pas de <head> trouvé (ne devrait pas arriver avec le template actuel) :
  // on préfixe le fichier pour ne quand même jamais publier une page indexable.
  return `${ROBOTS_META_TAG}\n${html}`;
}

function listProspectSlugs() {
  if (!fs.existsSync(PROSPECTS_DIR)) return [];
  return fs
    .readdirSync(PROSPECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function build() {
  fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });

  const slugs = listProspectSlugs();
  const deployed = [];
  const skipped = [];

  for (const slug of slugs) {
    const siteDir = path.join(PROSPECTS_DIR, slug, "site");
    if (!fs.existsSync(siteDir) || !fs.statSync(siteDir).isDirectory()) {
      // Pas de site/ généré (ex. prospects/example/, donnée de démo sans
      // site publiable) : rien à déployer pour ce prospect.
      skipped.push(slug);
      continue;
    }

    const destDir = path.join(DEPLOY_DIR, slug);
    fs.cpSync(siteDir, destDir, { recursive: true });

    const indexPath = path.join(destDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, "utf8");
      fs.writeFileSync(indexPath, ensureNoindex(html), "utf8");
    }

    deployed.push(slug);
  }

  fs.writeFileSync(
    path.join(DEPLOY_DIR, "robots.txt"),
    "User-agent: *\nDisallow: /\n",
    "utf8"
  );

  console.log(`deploy/ généré dans ${path.relative(REPO_ROOT, DEPLOY_DIR)}/`);
  console.log(`  ${deployed.length} site(s) copié(s) : ${deployed.join(", ") || "(aucun)"}`);
  if (skipped.length > 0) {
    console.log(`  ${skipped.length} prospect(s) ignoré(s) (pas de site/) : ${skipped.join(", ")}`);
  }
}

build();
