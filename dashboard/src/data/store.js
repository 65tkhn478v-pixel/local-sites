// Couche de persistance locale — V1 sans backend ni base de données.
// Les prospects sont stockés dans le localStorage du navigateur, initialisés
// avec MOCK_PROSPECTS au premier chargement.

import { MOCK_PROSPECTS } from "./mockProspects";
import { DEFAULT_PROSPECT_STATUS, DEFAULT_SITE_STATUS } from "./statuses";
import { createDefaultHours, createEmptyProspectFields } from "./prospectFields";

const STORAGE_KEY = "local-sites-dashboard/prospects";

// Complète les prospects existants (créés avant l'ajout d'un champ) avec des
// valeurs par défaut, sans écraser ce qui est déjà présent. Permet de faire
// évoluer le schéma sans migration ni base de données.
function normalizeProspect(prospect) {
  return {
    ...createEmptyProspectFields(),
    ...prospect,
    services: Array.isArray(prospect.services) ? prospect.services : [],
    hours: Array.isArray(prospect.hours) && prospect.hours.length
      ? prospect.hours
      : createDefaultHours(),
  };
}

function readAll() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROSPECTS));
    return MOCK_PROSPECTS.map(normalizeProspect);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeProspect) : [];
  } catch {
    return [];
  }
}

function writeAll(prospects) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
}

export function getProspects() {
  return readAll().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getProspect(id) {
  return readAll().find((p) => p.id === id) || null;
}

// Champs texte simples (hors services/hours, qui ont leur propre nettoyage).
const TEXT_FIELDS = [
  "name",
  "activity",
  "city",
  "address",
  "phone",
  "email",
  "currentWebsite",
  "instagram",
  "facebook",
  "description",
  "internalNotes",
];

function sanitizeFields(fields) {
  const clean = createEmptyProspectFields();
  TEXT_FIELDS.forEach((key) => {
    if (fields[key] !== undefined) clean[key] = fields[key]?.trim() || "";
  });
  clean.services = Array.isArray(fields.services)
    ? fields.services
        .map((s) => ({
          name: s.name?.trim() || "",
          description: s.description?.trim() || "",
          price: s.price?.trim() || "",
          duration: s.duration?.trim() || "",
        }))
        .filter((s) => s.name || s.description || s.price || s.duration)
    : [];
  clean.hours = Array.isArray(fields.hours) && fields.hours.length
    ? fields.hours.map((h) => ({ day: h.day, hours: h.hours?.trim() || "" }))
    : createDefaultHours();
  return clean;
}

export function createProspect(fields) {
  const prospects = readAll();
  const newProspect = {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
    ...sanitizeFields(fields),
    status: DEFAULT_PROSPECT_STATUS,
    siteStatus: DEFAULT_SITE_STATUS,
    siteUrl: null,
    createdAt: new Date().toISOString(),
  };
  prospects.push(newProspect);
  writeAll(prospects);
  return newProspect;
}

export function updateProspect(id, fields) {
  const prospects = readAll();
  const index = prospects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  // `fields` peut être un patch partiel (ex. changement de statut seul) ou le
  // formulaire complet (création/édition) : on ne nettoie que si les champs
  // "fiche" (texte, services, hours) sont présents, pour ne pas écraser
  // status/siteStatus/siteUrl gérés ailleurs.
  const hasFormFields = TEXT_FIELDS.some((key) => fields[key] !== undefined);
  const patch = hasFormFields ? sanitizeFields({ ...prospects[index], ...fields }) : fields;
  prospects[index] = { ...prospects[index], ...patch };
  writeAll(prospects);
  return prospects[index];
}

export function resetToDemoData() {
  writeAll(MOCK_PROSPECTS);
}

export function getStats() {
  const prospects = readAll();
  return {
    total: prospects.length,
    sitesGenerated: prospects.filter((p) => p.siteStatus === "Généré").length,
    toContact: prospects.filter((p) => p.status === "À contacter").length,
  };
}
