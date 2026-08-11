# local-sites

Infrastructure de sites vitrines pour prospects commerciaux : un template HTML/CSS/JS
vanilla, réutilisable pour plusieurs commerces en changeant uniquement un fichier de
données (`data.json`).

Aucune base de données, aucun backend, aucune API, aucune authentification,
aucune dépendance externe.

## Structure

```
templates/
  business/
    index.html   → structure de la page (conteneurs vides + <template> pour les listes)
    style.css    → design responsive (mobile-first)
    script.js    → charge data.json et injecte le contenu dans la page

prospects/
  example/
    data.json    → données du commerce fictif de démonstration (barbier à Lille)

dashboard/       → dashboard interne (V1) pour piloter la création de sites
                   prospects. Application séparée (Vite + React), données
                   mockées en localStorage. Voir dashboard/README.md.
```

Le HTML ne contient **aucune information propre à un commerce** : tout (nom, textes,
services, tarifs, galerie, avis, horaires, coordonnées) vient de `data.json` et est
injecté dynamiquement par `script.js` via `data-bind`, `data-bind-href` et `data-list`.

## Lancer le site en local

Le JavaScript charge `data.json` via `fetch()`, ce qui nécessite de servir les fichiers
en HTTP (ouvrir `index.html` directement avec `file://` bloque le fetch dans la plupart
des navigateurs). Le template pointe vers `data.json` avec un chemin relatif
(`../../prospects/example/data.json`) : il faut donc servir **la racine du repository**
(`local-sites/`), pas seulement `templates/business/`, pour que ce chemin résolve
correctement. Depuis la racine `local-sites/` :

```bash
# Option 1 — Python (déjà installé sur la plupart des machines)
python -m http.server 8000
# puis ouvrir http://localhost:8000/templates/business/

# Option 2 — Node.js, sans installation globale
npx serve .
# puis ouvrir l'URL affichée + /templates/business/
```

Par défaut, la page charge les données de démonstration
(`prospects/example/data.json`), référencées dans `index.html` via :

```html
<meta name="data-source" content="../../prospects/example/data.json">
```

## Créer un site pour un nouveau prospect

1. Copiez `templates/business/` vers `prospects/<nom-du-prospect>/`.
2. Dans ce nouveau dossier, créez un `data.json` avec les informations du commerce
   (reprenez `prospects/example/data.json` comme modèle).
3. Dans le `index.html` copié, changez la balise meta pour pointer vers le fichier local :
   ```html
   <meta name="data-source" content="data.json">
   ```
4. Servez le dossier en HTTP (voir ci-dessus) pour vérifier le rendu.

Le template (`templates/business/`) lui-même ne doit pas être modifié par commerce —
seul un `data.json` change.

## Contenu du template

Hero, présentation, services & tarifs, galerie, avis clients, horaires, adresse
(lien Google Maps), téléphone (lien `tel:`), CTA de réservation, footer.

## Dashboard interne

Le dossier `dashboard/` contient une application séparée (V1) pour gérer la liste
des prospects et suivre leur avancement. Elle ne modifie ni ne dépend de
`templates/business/`. Voir `dashboard/README.md` pour le détail et le lancement.
