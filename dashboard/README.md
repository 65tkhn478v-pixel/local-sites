# Dashboard interne — V1

Interface locale pour piloter la création de sites vitrines pour les prospects.

**V1 = interface et logique locale uniquement.** Pas de backend, pas de base de
données, pas d'API externe, pas d'authentification, pas de Cloudflare, pas de
génération réelle de site ou d'email. Les données sont mockées et stockées dans le
`localStorage` du navigateur.

## Stack

Vite + React + React Router, JavaScript simple, CSS écrit à la main (aucun framework
UI). Choix expliqué dans la conversation d'origine : le repo n'a aucun outillage de
build existant, mais un dashboard multi-pages avec état partagé (liste, création,
détail, édition) tire vraiment parti de composants réutilisables — plus qu'en vanilla
JS comme `templates/business/`, qui lui reste volontairement sans dépendance.

## Lancer en local

```bash
cd dashboard
npm install
npm run dev
```

Puis ouvrir l'URL affichée (`http://localhost:5173/` par défaut).

## Données

Au premier lancement, le dashboard initialise le `localStorage` avec des prospects
de démonstration (`src/data/mockProspects.js`). Ensuite, toute création/modification
passe par `src/data/store.js` et persiste dans le navigateur — rien n'est écrit sur
disque, rien n'est partagé entre navigateurs/machines.

Un bouton "Réinitialiser les données de démo" sur le Dashboard permet de repartir
du jeu de données d'origine.

## Pages

- **Dashboard** (`/`) — statistiques (prospects, sites générés, à contacter) + liste
  des prospects + bouton "+ Nouveau prospect".
- **Nouveau prospect** (`/prospects/new`) — formulaire de création.
- **Détail prospect** (`/prospects/:id`) — toutes les informations, statut prospect
  (modifiable), statut du site, boutons "Générer le site" (génère réellement un site
  local à partir de `templates/business/`, voir ci-dessous) et "Générer l'email"
  (visuel uniquement en V1 — aucune génération réelle), "Voir le site" (si un site
  est marqué comme généré) et "Modifier".
- **Modifier prospect** (`/prospects/:id/edit`) — même formulaire que la création,
  pré-rempli.

## Génération de site (première fonctionnalité métier)

Le bouton "Générer le site" appelle `POST /api/generate-site`, une route exposée
uniquement par le serveur de dev Vite (`vite.config.js` + `server/generateSite.js`,
voir dans ce dossier). Elle tourne **uniquement avec `npm run dev`** (aucun serveur de
production, aucun backend distant) et :

1. slugifie le nom du commerce (`"Le Barbier Lillois"` → `"le-barbier-lillois"`) ;
2. crée `prospects/<slug>/data.json` avec les informations du prospect, au format
   attendu par `templates/business/` (les sections non collectées par le dashboard —
   services, galerie, avis, horaires — reçoivent un contenu générique explicitement
   marqué "à compléter", jamais des informations inventées) ;
3. copie `templates/business/{index.html,style.css,script.js}` directement à plat
   dans `prospects/<slug>/` (pas de sous-dossier), en adaptant uniquement le chemin
   `data-source` de la copie vers `./data.json` — le template original n'est jamais
   modifié ;
4. écrit `prospects/<slug>/wrangler.jsonc` (`assets.directory: "."`) s'il n'existe
   pas encore, pour permettre un déploiement Cloudflare indépendant de ce prospect
   (`npx wrangler deploy` depuis `prospects/<slug>/`) ;
5. met à jour le prospect dans le dashboard : `siteStatus = "Généré"`,
   `siteUrl = "/prospects/<slug>/index.html"`.

Chaque prospect généré est ainsi un site autonome à plat (`data.json`, `index.html`,
`style.css`, `script.js`, `wrangler.jsonc` au même niveau dans `prospects/<slug>/`) —
la même convention que les sites prospects créés manuellement (ex.
`prospects/restaurant-italien-test/`).

Régénérer un prospect déjà généré écrase `data.json`, `index.html`, `style.css` et
`script.js` (idempotent) ; deux prospects différents dont le nom se slugifierait à
l'identique reçoivent des dossiers distincts (`<slug>-2`, `<slug>-3`, …).
`wrangler.jsonc`, lui, n'est jamais réécrit une fois créé — une régénération ne doit
pas effacer une config personnalisée après déploiement (nom de projet Cloudflare,
routes...).

Le serveur de dev sert aussi directement `/prospects/**` et `/templates/**` (lecture
disque, dev-only), donc le bouton "Voir le site" ouvre le site généré immédiatement,
sans lancer de second serveur statique.

## Limites connues de la V1

- "Générer l'email" n'exécute aucune action réelle — il affiche une notification
  indiquant que la fonctionnalité arrivera plus tard.
- Le bouton "Voir le site" des prospects de **démonstration** pré-marqués "Site
  généré" dans `mockProspects.js` (jamais passés par le vrai bouton "Générer le
  site") pointe vers `templates/business/` : il ne s'ouvrira que si vous servez
  l'ensemble du repository en statique depuis sa racine (voir le README principal).
  Les sites réellement générés via le bouton s'ouvrent directement depuis le
  serveur de dev, voir ci-dessus.
- Les données prospect ne sont pas partagées entre navigateurs, machines, ni
  persistées hors du `localStorage` : c'est un choix volontaire pour cette V1 sans
  base de données. Les fichiers générés par "Générer le site", eux, sont écrits sur
  disque dans `prospects/` et donc bien réels et partagés (via le repo git).
