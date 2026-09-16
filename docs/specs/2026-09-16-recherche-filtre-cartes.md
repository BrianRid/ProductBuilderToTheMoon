# Feature 6 — Recherche / filtre de cartes

- **Issue** : [#6](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/6)
- **Branche** : `feature/paul-search-filter`
- **Date** : 2026-09-16

## Objectif

Permettre de retrouver une carte sur un board qui en contient beaucoup, sans
avoir à parcourir les trois colonnes à l'œil. Une barre de recherche au-dessus
du board masque en direct toutes les cartes dont le titre ne correspond pas à
la saisie, et les trois colonnes continuent de montrer ce qui reste.

## Hors scope

| Écarté | Pourquoi |
|---|---|
| Persistance du filtre entre deux sessions | Supposerait de toucher `board-context.tsx`, terrain de la feature 5 |
| Recherche par label ou par date d'échéance | Ces champs n'existent pas encore : ils arrivent avec la feature 7 |
| Debounce de la saisie | Le board tient en mémoire, optimiser ici serait prématuré |
| Normalisation des accents | Même raison ; à rouvrir si le contenu réel le justifie |
| Filtre par colonne ou par statut | L'issue #6 parle de recherche par titre uniquement |
| Modification du `StatusPill` | Voir la décision 2 ci-dessous |

## Comportement attendu

| Situation | Attendu |
|---|---|
| Champ vide | Toutes les cartes s'affichent, board strictement identique à aujourd'hui |
| Saisie qui correspond | Seules les cartes dont le titre contient la saisie restent visibles |
| Casse différente | `EXEMPLE` et `exemple` donnent le même résultat |
| Espaces autour de la saisie | La saisie est trimmée avant comparaison |
| Aucune correspondance | Message « Aucune carte ne correspond à « … » », et **les trois colonnes restent affichées** à `00` |
| Champ vidé | Retour immédiat à l'état initial |

### Trois décisions que l'issue ne tranche pas

1. **Les compteurs de colonne affichent le nombre filtré.** Conséquence directe
   du fait que `<Column>` reçoit les cartes déjà filtrées. C'est cohérent : le
   compteur décrit ce qu'on voit à l'écran.
2. **Le `StatusPill` continue d'afficher le total.** Pendant une recherche,
   l'en-tête peut donc indiquer « 03 cartes en vol » alors que le board n'en
   montre qu'une. C'est volontaire : le pill résume l'état du board, pas la
   vue courante. Ça évite aussi de toucher `status-pill.tsx`.
3. **Le filtre n'est pas persistant.** Il disparaît au rechargement, cf. hors
   scope.

Si l'un de ces trois points vous gêne, c'est le moment de le dire — pas après
le merge.

### Conformité au design system

`DESIGN.md` (PR #8) a été mergé pendant le développement de cette feature. La
`SearchBar` a été réalignée sur la spec **Inputs / Fields** : fond Raised
Module, bordure Structural Line, rayon `6px`, texte Lunar Paper, placeholder
Telemetry Muted, padding `8px 12px`, ombre *Module Rest* au repos, et au focus
une bordure Launch Amber doublée d'un anneau ambre translucide.

## Impact sur les autres features

Cette feature introduit une situation que le board ne connaissait pas : **une
carte peut exister dans l'état tout en étant invisible à l'écran.** Rien de
bloquant ici, mais voici les cas limites que ça crée ailleurs.

| Feature | Situation | Suggestion |
|---|---|---|
| 1 — Drag & drop | Les index de drop sont calculés sur une liste filtrée, donc potentiellement faux | Calculer la cible sur la liste complète, ou désactiver le drag pendant un filtre actif |
| 2 — Formulaire d'ajout | Une carte ajoutée pendant un filtre actif peut ne pas correspondre et rester invisible : l'ajout semble avoir échoué | Vider le filtre après un ajout réussi |
| 3 — Édition inline | Éditer un titre pendant un filtre fait disparaître la carte en cours de frappe | Ne réappliquer le filtre qu'à la validation, pas à chaque frappe |
| 7 — Labels et dates | Voudra sûrement chercher aussi par label | Le prédicat est isolé sur une ligne dans `board.tsx` : un `\|\|` suffit |
| 4 — Suppression + undo | Aucune interaction | — |
| 5 — Persistance localStorage | Aucune interaction : le filtre n'est pas persisté | — |

## Changements par fichier

### `components/search-bar.tsx` — nouveau

Composant présentationnel pur, sans état : il reçoit `value` et `onChange`.
Pas de directive `"use client"`, cohérent avec `column.tsx` et `card.tsx` qui
héritent du client boundary de `board.tsx`.

### `components/board.tsx`

Trois ajouts seulement :

1. un `useState` pour la saisie (le `"use client"` est déjà présent) ;
2. un `visibleCards` calculé avant le rendu ;
3. la ligne existante passe de `state.cards.filter(...)` à
   `visibleCards.filter(...)`.

```tsx
const search = query.trim().toLowerCase();
const visibleCards = search
  ? state.cards.filter((card) => card.title.toLowerCase().includes(search))
  : state.cards;
```

Le `<div>` qui contient les colonnes est **structurellement inchangé** :
mêmes classes, même `COLUMNS.map`, seule la source des cartes diffère. C'est
délibéré, voir les notes Git.

### `docs/specs/README.md`

Ajout de la ligne de la feature 6 dans le tableau des specs.

## Vérification

```bash
npm run lint
npm run build
```

Puis dans `npm run dev` :

1. Au chargement, le board affiche la carte d'exemple et les compteurs `01 / 00 / 00`.
2. Saisir `exemple` : la carte reste visible, compteurs inchangés.
3. Saisir `EXEMPLE` : même résultat, la casse est ignorée.
4. Saisir `   exemple   ` : même résultat, les espaces sont trimmés.
5. Saisir `zzz` : la carte disparaît, compteurs `00 / 00 / 00`, message d'état vide affiché, les trois colonnes restent en place.
6. Vider le champ : retour à l'état de l'étape 1.

Ces six scénarios ont été repassés dans un navigateur automatisé, 15
assertions au vert, aucune erreur serveur dans le log de `next dev`.

## Notes Git

**Cette feature ne touche ni `board/types.ts` ni `board/reducer.ts`**,
conformément à l'énoncé de l'issue (« state local, pas de changement du
reducer »). Elle ne touche pas non plus `board-context.tsx`, `column.tsx`,
`card.tsx`, `status-pill.tsx` ni `app/page.tsx`.

Le seul fichier de code partagé est `components/board.tsx`, disputé avec la
**feature 1 (drag & drop)**. Cette feature étant première dans l'ordre de merge
suggéré, c'est la feature 1 qui rebasera. Pour ce rebase : garder la ligne
`visibleCards.filter(...)` et placer le `DndContext` autour du `<div>` des
colonnes. Le bloc a été gardé identique exprès pour que la résolution tienne
en une ligne.

`docs/specs/README.md` est modifié pour y ajouter une ligne : un conflit de
tableau est possible si plusieurs specs sont déposées en même temps. Il se
résout en gardant les lignes des deux côtés.

## Dépendances

Aucune.
