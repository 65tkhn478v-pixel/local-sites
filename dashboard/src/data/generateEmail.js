// Génération locale et déterministe de l'email de prospection à partir des
// données du prospect. Fonction pure : aucune écriture disque, aucun appel
// réseau, aucune information inventée — seules les données réellement
// renseignées sur le prospect sont utilisées. Aucun envoi automatique.

const SIGNATURE = "Cordialement,";

function buildConstat(prospect) {
  const currentWebsite = prospect.currentWebsite?.trim();
  const instagram = prospect.instagram?.trim();

  if (currentWebsite) {
    return `J'ai vu que vous avez un site actuellement (${currentWebsite}).`;
  }
  if (instagram) {
    return "J'ai vu que vous êtes présents sur Instagram, mais je ne trouve pas de site à côté.";
  }
  return "Je ne trouve pas de site internet à votre nom actuellement.";
}

function buildProposition(prospect, name) {
  const hasCurrentWebsite = Boolean(prospect.currentWebsite?.trim());
  const siteUrl = prospect.siteUrl?.trim?.() || prospect.siteUrl;

  if (siteUrl) {
    const intro = hasCurrentWebsite
      ? `Je vous ai préparé, à toutes fins utiles, un aperçu de ce à quoi pourrait ressembler une autre version de site vitrine pour ${name} : ${siteUrl}`
      : `Je vous ai préparé un aperçu de ce à quoi pourrait ressembler un site vitrine pour ${name} : ${siteUrl}`;
    return `${intro}\n\nN'hésitez pas à y jeter un œil, sans engagement de votre part.`;
  }

  return hasCurrentWebsite
    ? `Si ça peut vous être utile, je peux vous préparer, à toutes fins utiles, un aperçu de ce à quoi pourrait ressembler une autre version de site vitrine pour ${name}, sans engagement de votre part.`
    : `Si ça peut vous être utile, je peux vous préparer rapidement un aperçu de ce à quoi pourrait ressembler un site vitrine pour ${name}, sans engagement de votre part.`;
}

/**
 * "Pain artisanal\nViennoiseries" → ["Pain artisanal", "Viennoiseries"]
 * Ne reformule jamais les libellés : simple découpage de la représentation
 * ligne par ligne du champ `services` en liste lisible.
 */
function parseServicesList(rawServices) {
  return (rawServices || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildOptionalLine(prospect, name) {
  const services = parseServicesList(prospect.services);
  if (services.length > 0) {
    return `Pour ${services.join(", ")} : un site clair peut aider à donner envie de passer.`;
  }

  const description = prospect.description?.trim();
  if (description) {
    return `Sur votre fiche, vous décrivez ${name} comme : « ${description} ».`;
  }

  return "";
}

/**
 * Génère { subject, body } pour l'email de prospection d'un prospect.
 * `name`, `activity` et `city` sont requis (déjà obligatoires à la création
 * du prospect côté formulaire).
 */
export function generateEmail(prospect) {
  const name = prospect?.name?.trim();
  const activity = prospect?.activity?.trim();
  const city = prospect?.city?.trim();

  if (!name || !activity || !city) {
    throw new Error(
      "Le prospect doit avoir un nom, une activité et une ville pour générer un email."
    );
  }

  const subject = `Une proposition de site vitrine pour ${name}`;

  const paragraphs = [
    "Bonjour,",
    `Je me permets de vous contacter au sujet de ${name}, ${activity} à ${city}.`,
    buildConstat(prospect),
    buildProposition(prospect, name),
  ];

  const optionalLine = buildOptionalLine(prospect, name);
  if (optionalLine) paragraphs.push(optionalLine);

  paragraphs.push(
    "Si cela vous intéresse, il vous suffit de répondre à ce message, je me ferai un plaisir d'en discuter avec vous.",
    `Bonne journée,\n\n${SIGNATURE}`
  );

  const body = paragraphs.join("\n\n");

  return { subject, body };
}
