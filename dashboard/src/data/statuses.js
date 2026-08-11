// Statuts possibles d'un prospect (V1 — données locales uniquement).
export const PROSPECT_STATUSES = [
  "À préparer",
  "Site généré",
  "À contacter",
  "Contacté",
  "Réponse",
  "Rendez-vous",
  "Client",
  "Refus",
];

export const DEFAULT_PROSPECT_STATUS = "À préparer";

// Statut du site généré pour le prospect (indépendant du statut prospect).
export const SITE_STATUSES = ["Non généré", "Généré"];
export const DEFAULT_SITE_STATUS = "Non généré";

// Couleur associée à chaque statut prospect, pour les badges.
export const STATUS_COLORS = {
  "À préparer": "neutral",
  "Site généré": "info",
  "À contacter": "warning",
  Contacté: "info",
  Réponse: "info",
  "Rendez-vous": "accent",
  Client: "success",
  Refus: "danger",
};
