// Génération locale de site prospect à partir de templates/business/.
//
// Module Node pur (aucune dépendance) utilisé par le middleware de
// dev server Vite (voir vite.config.js) qui l'expose via POST /api/generate-site.
//
// Ne duplique pas le code métier du template : ce module lit et copie
// templates/business/ tel quel, il ne réécrit jamais son HTML/CSS/JS
// (seule la balise <meta name="data-source"> de la copie est adaptée pour
// pointer vers le data.json du prospect).

import fs from "node:fs";
import path from "node:path";

const TEMPLATE_DIR = "templates/business";
const PROSPECTS_DIR = "prospects";
const TEMPLATE_FILES = ["index.html", "style.css", "script.js"];

/**
 * "Le Barbier Lillois" → "le-barbier-lillois"
 */
export function slugify(name) {
  const slug = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enleve les accents (marques diacritiques combinantes)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "prospect";
}

function initials(name) {
  const words = (name || "").split(/\s+/).filter(Boolean);
  const value = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return value || "??";
}

function phoneHref(phone) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

/**
 * "Coupe homme\nRasage" → [{ name: "Coupe homme", ... }, { name: "Rasage", ... }]
 * Le dashboard ne collecte qu'un nom par service (un par ligne) ; prix et
 * durée restent à compléter directement dans data.json.
 */
function parseServices(rawServices) {
  if (typeof rawServices !== "string") return null;

  const lines = rawServices
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return lines.map((name) => ({
    name,
    description: "Détaillez ici ce service et son tarif.",
    price: "—",
    duration: "—",
  }));
}

/**
 * Construit un data.json compatible avec templates/business/ à partir des
 * champs (limités) collectés par le dashboard. Les sections que le
 * dashboard ne renseigne pas encore (galerie, avis, horaires) reçoivent un
 * contenu générique explicitement marqué "à compléter", pour que le site
 * généré s'affiche correctement sans jamais inventer de fausses
 * informations commerciales (horaires, avis...).
 */
export function buildProspectData(prospect) {
  const name = prospect.name?.trim() || "Commerce local";

  return {
    business: {
      name,
      tagline: prospect.activity || "",
      city: prospect.city || "",
      logoInitials: initials(name),
    },
    hero: {
      title: `Bienvenue chez ${name}`,
      subtitle:
        prospect.description?.trim() ||
        [prospect.activity, prospect.city].filter(Boolean).join(" à ") ||
        "Site vitrine généré automatiquement.",
      ctaLabel: "Nous contacter",
    },
    about: {
      title: "Notre activité",
      text:
        prospect.description?.trim() ||
        "Présentation à compléter : décrivez l'activité, le savoir-faire et ce qui différencie ce commerce.",
      highlights: [
        "Contenu généré automatiquement — à personnaliser dans data.json",
      ],
    },
    services: parseServices(prospect.services) || [
      {
        name: "Prestation à définir",
        description: "Détaillez ici les services et tarifs proposés.",
        price: "—",
        duration: "—",
      },
    ],
    gallery: [{ caption: "Photo à ajouter", color: "#2b2118" }],
    reviews: [
      {
        author: "Avis à ajouter",
        rating: 5,
        text: "Remplacez cet avis d'exemple par un vrai retour client.",
      },
    ],
    hours: [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ].map((day) => ({ day, hours: "Horaires à renseigner" })),
    contact: {
      address: prospect.address || "",
      phone: prospect.phone || "",
      phoneHref: phoneHref(prospect.phone),
      email: "",
      mapsQuery: prospect.address || "",
    },
    social: {
      instagram: prospect.instagram || "",
      facebook: "",
    },
    footer: {
      text: `${name} — Tous droits réservés`,
    },
    _generation: {
      prospectId: prospect.id ?? null,
      generatedAt: new Date().toISOString(),
      source: "dashboard-v1-local",
    },
  };
}

/**
 * Choisit le dossier prospects/<slug>/ à utiliser : régénère en place si
 * le dossier existant appartient déjà à ce même prospect (id), sinon
 * ajoute un suffixe numérique pour éviter d'écraser un autre prospect
 * dont le nom se slugifierait de façon identique.
 */
function resolveSlug(repoRoot, baseSlug, prospectId) {
  let candidate = baseSlug;
  let attempt = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dir = path.join(repoRoot, PROSPECTS_DIR, candidate);
    if (!fs.existsSync(dir)) return candidate;

    const dataFile = path.join(dir, "data.json");
    if (fs.existsSync(dataFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(dataFile, "utf8"));
        if (existing?._generation?.prospectId === prospectId) {
          return candidate; // même prospect → on régénère par-dessus
        }
      } catch {
        // data.json illisible : on considère le slug occupé, on continue
      }
    }

    candidate = `${baseSlug}-${attempt}`;
    attempt += 1;
  }
}

function copyTemplateFile(repoRoot, fileName, destDir, transform) {
  const src = path.join(repoRoot, TEMPLATE_DIR, fileName);
  const content = fs.readFileSync(src, "utf8");
  fs.writeFileSync(
    path.join(destDir, fileName),
    transform ? transform(content) : content,
    "utf8"
  );
}

/**
 * Écrit prospects/<slug>/wrangler.jsonc pour permettre un déploiement
 * Cloudflare indépendant du prospect (assets servis directement depuis
 * prospects/<slug>/, à plat). N'écrase jamais un wrangler.jsonc déjà présent :
 * une fois le site déployé, ce fichier peut être personnalisé à la main
 * (routes, nom de projet Cloudflare...) et une régénération ne doit pas
 * l'effacer.
 */
function writeWranglerConfig(prospectDir, slug) {
  const wranglerPath = path.join(prospectDir, "wrangler.jsonc");
  if (fs.existsSync(wranglerPath)) return wranglerPath;

  const config = {
    name: slug,
    compatibility_date: new Date().toISOString().slice(0, 10),
    assets: {
      directory: ".",
    },
  };
  fs.writeFileSync(wranglerPath, JSON.stringify(config, null, 2) + "\n", "utf8");
  return wranglerPath;
}

/**
 * Génère (ou régénère) le site local d'un prospect à partir de
 * templates/business/. Ne modifie jamais le template : ne fait que le
 * lire et copier son contenu.
 *
 * Structure produite, à plat, dans prospects/<slug>/ : data.json,
 * index.html, style.css, script.js, wrangler.jsonc — déployable
 * indépendamment (mêmes conventions que les sites prospects manuels).
 *
 * @returns {{slug: string, prospectDir: string, dataPath: string, sitePath: string, siteUrl: string}}
 */
export function generateSite(prospect, { repoRoot }) {
  if (!prospect || !prospect.name || !prospect.name.trim()) {
    throw new Error("Le prospect doit avoir un nom pour générer un site.");
  }

  for (const file of TEMPLATE_FILES) {
    const src = path.join(repoRoot, TEMPLATE_DIR, file);
    if (!fs.existsSync(src)) {
      throw new Error(`Fichier de template introuvable : ${TEMPLATE_DIR}/${file}`);
    }
  }

  const slug = resolveSlug(repoRoot, slugify(prospect.name), prospect.id ?? null);
  const prospectDir = path.join(repoRoot, PROSPECTS_DIR, slug);

  fs.mkdirSync(prospectDir, { recursive: true });

  const data = buildProspectData(prospect);
  fs.writeFileSync(
    path.join(prospectDir, "data.json"),
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  // index.html : on adapte uniquement le chemin vers data.json (les deux
  // fichiers vivent désormais au même niveau, dans prospects/<slug>/).
  copyTemplateFile(repoRoot, "index.html", prospectDir, (html) =>
    html.replace(
      /<meta name="data-source" content="[^"]*">/,
      '<meta name="data-source" content="./data.json">'
    )
  );
  copyTemplateFile(repoRoot, "style.css", prospectDir);
  copyTemplateFile(repoRoot, "script.js", prospectDir);

  const wranglerPath = writeWranglerConfig(prospectDir, slug);

  return {
    slug,
    prospectDir: path.relative(repoRoot, prospectDir),
    dataPath: path.relative(repoRoot, path.join(prospectDir, "data.json")),
    sitePath: path.relative(repoRoot, prospectDir),
    wranglerPath: path.relative(repoRoot, wranglerPath),
    siteUrl: `/${PROSPECTS_DIR}/${slug}/index.html`,
  };
}
