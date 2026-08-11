// Schéma des informations "fiche prospect" (V1 — localStorage uniquement).
//
// Centralise ici la forme complète d'un prospect : c'est la référence commune
// entre le formulaire (ProspectFormPage), la fiche détail (ProspectDetailPage)
// et la persistance (store.js). Les champs `services` et `hours` reprennent
// volontairement la forme attendue par `templates/business/` (voir
// `prospects/example/data.json`), pour qu'une future génération de site
// puisse consommer ces données sans transformation.

export const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export function createDefaultHours() {
  return DAYS_OF_WEEK.map((day) => ({ day, hours: "" }));
}

export function createEmptyService() {
  return { name: "", description: "", price: "", duration: "" };
}

// Forme complète d'un prospect, hors champs gérés par le système
// (id, createdAt, status, siteStatus, siteUrl — voir store.js).
export function createEmptyProspectFields() {
  return {
    // Identité
    name: "",
    activity: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    // Présence en ligne
    currentWebsite: "",
    instagram: "",
    facebook: "",
    // Contenu
    description: "",
    services: [],
    hours: createDefaultHours(),
    // Commercial
    internalNotes: "",
  };
}
