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
  (modifiable), statut du site, boutons "Générer le site" et "Générer l'email"
  (visuels uniquement en V1 — aucune génération réelle), "Voir le site" (si un site
  est marqué comme généré) et "Modifier".
- **Modifier prospect** (`/prospects/:id/edit`) — même formulaire que la création,
  pré-rempli.

## Limites connues de la V1

- "Générer le site" et "Générer l'email" n'exécutent aucune action réelle — ils
  affichent une notification indiquant que la fonctionnalité arrivera plus tard.
- Le bouton "Voir le site" des prospects de démonstration marqués "Site généré"
  pointe vers un chemin relatif vers `templates/business/` : il ne s'ouvrira que si
  vous servez l'ensemble du repository en statique depuis sa racine (voir le README
  principal), pas si vous n'avez lancé que `npm run dev` dans `dashboard/`.
- Les données ne sont pas partagées entre navigateurs, machines, ni persistées hors
  du `localStorage` : c'est un choix volontaire pour cette V1 sans base de données.
