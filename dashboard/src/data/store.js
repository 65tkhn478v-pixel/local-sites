// Couche de persistance locale — V1 sans backend ni base de données.
// Les prospects sont stockés dans le localStorage du navigateur, initialisés
// avec MOCK_PROSPECTS au premier chargement.

import { MOCK_PROSPECTS } from "./mockProspects";
import { DEFAULT_PROSPECT_STATUS, DEFAULT_SITE_STATUS } from "./statuses";

const STORAGE_KEY = "local-sites-dashboard/prospects";

// Garantit un tableau `services`, y compris pour les prospects créés avant
// l'ajout de ce champ (pas de migration nécessaire).
function withServices(prospect) {
  return Array.isArray(prospect.services) ? prospect : { ...prospect, services: [] };
}

function readAll() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROSPECTS));
    return MOCK_PROSPECTS.map(withServices);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(withServices) : [];
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

// Nettoie une liste de services : retire les espaces superflus et les lignes
// entièrement vides.
function sanitizeServices(services) {
  return Array.isArray(services)
    ? services
        .map((s) => ({
          name: s.name?.trim() || "",
          description: s.description?.trim() || "",
          price: s.price?.trim() || "",
          duration: s.duration?.trim() || "",
        }))
        .filter((s) => s.name || s.description || s.price || s.duration)
    : [];
}

export function createProspect(fields) {
  const prospects = readAll();
  const newProspect = {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
    name: fields.name?.trim() || "",
    activity: fields.activity?.trim() || "",
    city: fields.city?.trim() || "",
    address: fields.address?.trim() || "",
    phone: fields.phone?.trim() || "",
    currentWebsite: fields.currentWebsite?.trim() || "",
    instagram: fields.instagram?.trim() || "",
    description: fields.description?.trim() || "",
    services: sanitizeServices(fields.services),
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
  const patch = fields.services !== undefined
    ? { ...fields, services: sanitizeServices(fields.services) }
    : fields;
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
