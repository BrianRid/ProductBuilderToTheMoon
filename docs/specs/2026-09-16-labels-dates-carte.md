# Feature 7 — Labels colorés + date d'échéance

- **Issue** : [#7](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/7)
- **Branche** : `feature/elisa-labels-dates`
- **Date** : 2026-09-16

## Objectif

Permettre de poser sur une carte un label coloré (au plus un) et une date
d'échéance, directement depuis le board. Une carte dont l'échéance est
dépassée et qui n'est pas dans la colonne « Terminé » est mise en avant
visuellement, pour signaler un retard sans avoir à ouvrir la carte.

## Hors scope

Décidé explicitement, à ne pas implémenter dans cette PR :

- **Pas de nom affiché sur le label.** Le label est une couleur seule, sans
  texte associé, malgré la règle du `DESIGN.md` qui recommande d'associer
  toute couleur d'état à un libellé. Choix délibéré pour garder l'éditeur
  inline minimal. Compensé par un attribut `title` HTML sur la pastille
  (nom de la couleur au survol), pour ne pas perdre toute accessibilité.
- **Un seul label par carte**, pas de multi-label. Simplifie le modèle de
  données et l'UI ; à revoir si le besoin de plusieurs labels apparaît.
- **Pas d'heure sur l'échéance**, seulement une date (`YYYY-MM-DD`).
- **Pas de persistance** (`localStorage`) — c'est la feature 5. Poser un
  label/une date fonctionne pendant la session, mais se perd au
  rafraîchissement, comme tout le reste du state aujourd'hui.
- **Mise en avant désactivée en colonne « Terminé ».** Une carte en retard
  mais déplacée en Terminé n'affiche plus l'alerte : une tâche faite en
  retard n'a plus besoin d'alerter personne.

## Comportement attendu

### Ouvrir l'éditeur label/date

Un clic sur la ligne de métadonnées de la carte (là où vit déjà le numéro
de série `#01`) ouvre un petit panneau inline, sous le titre :

- 4 pastilles de couleur (`rust`, `plum`, `slate`, `moss`) pour le label.
  Cliquer sur la pastille déjà active la désélectionne (retire le label,
  `label: null`). Cliquer sur une autre pastille remplace la sélection.
- Un `<input type="date">` natif pour l'échéance, pré-rempli avec la date
  actuelle de la carte si elle existe. Vider le champ retire l'échéance.

L'état d'édition est local à la carte, comme pour l'édition de titre
(feature 3) : ouvrir ce panneau sur une carte ne touche pas les autres.

### Sortir de l'éditeur

Mêmes sorties que l'édition de titre :

| Geste | Résultat |
|---|---|
| `Enter` (dans le champ date) | valide |
| Clic en dehors du panneau (`blur`) | valide |
| `Escape` | annule, restaure le label/date d'origine |

Contrairement à l'édition de titre, il n'y a pas de règle de
normalisation à trancher ici : le label est une valeur parmi 4 (ou aucune),
la date est soit une date ISO valide soit vide — pas de cas « valeur
invalide mais non vide » à gérer puisque l'`<input type="date">` empêche
la saisie d'un texte libre invalide.

Chaque changement (label ou date) envoie sa propre action au reducer dès
qu'il est confirmé — il n'y a pas de bouton « valider » unique pour les
deux champs.

### Affichage sur la carte (hors édition)

- **Label** : une pastille colorée sous le titre, à côté du numéro de
  série. Absente si aucun label.
- **Date** : affichée en `IBM Plex Mono`, à côté de la pastille. Absente
  si aucune échéance.
- **Retard** : si `dueDate` est strictement antérieure à la date du jour
  **et** `card.columnId !== "done"` → le texte de la date passe dans une
  couleur d'alerte dédiée (à ajouter au `DESIGN.md`, distincte de `rust`
  pour ne pas laisser croire qu'il s'agit du label), et la bordure
  latérale de la carte (déjà utilisée pour l'état hover) prend cette même
  couleur au repos.

## Changements par fichier

### `board/types.ts`

```ts
export type LabelColor = "rust" | "plum" | "slate" | "moss";

export interface Card {
  id: string;
  title: string;
  columnId: ColumnId;
  label?: LabelColor;
  dueDate?: string; // ISO "YYYY-MM-DD"
}

export type BoardAction =
  | { type: "NOOP" }
  | { type: "EDIT_CARD"; id: string; title: string }
  | { type: "SET_LABEL"; id: string; label: LabelColor | null }
  | { type: "SET_DUE_DATE"; id: string; dueDate: string | null };
```

Deux variants séparés (`SET_LABEL`, `SET_DUE_DATE`) plutôt qu'une action
combinée : chaque champ peut être posé, changé ou effacé indépendamment,
et ça reste cohérent avec le style « un variant par champ » déjà utilisé
pour `EDIT_CARD`. Le formatage — un variant par ligne, `|` en tête de
ligne — est repris pour rendre les conflits avec les autres features
résolubles en gardant simplement toutes les lignes.

### `board/reducer.ts`

Deux `case` supplémentaires, avant le `default` :

```ts
case "SET_LABEL":
  return {
    ...state,
    cards: state.cards.map((card) =>
      card.id === action.id
        ? { ...card, label: action.label ?? undefined }
        : card,
    ),
  };
case "SET_DUE_DATE":
  return {
    ...state,
    cards: state.cards.map((card) =>
      card.id === action.id
        ? { ...card, dueDate: action.dueDate ?? undefined }
        : card,
    ),
  };
```

Mise à jour immuable, même logique que `EDIT_CARD` : nouveau tableau,
nouvel objet carte, aucune mutation. `null` reçu du composant est converti
en `undefined` sur la carte pour rester cohérent avec des champs
optionnels (pas de `null` dans le type `Card`).

### `DESIGN.md`

Ajouter une petite palette de labels, distincte de Launch Amber (réservé
aux signaux actifs) et Mission Complete (réservé à l'état terminé) :

- **Rust** — alerte/urgent
- **Plum** — idée/en réflexion
- **Slate** — en pause/bloqué
- **Moss** — neutre/faible priorité

Plus une couleur d'alerte de retard dédiée (distincte de `rust`), utilisée
uniquement pour l'échéance dépassée — jamais comme couleur de label.

### `components/card.tsx`

Nouvel état local `isEditingMeta: boolean` (indépendant de `isEditing`
pour le titre — les deux éditeurs ne s'ouvrent jamais ensemble). Deux
drafts locaux, `draftLabel` et `draftDueDate`, initialisés aux valeurs
actuelles de la carte à l'ouverture.

- Clic sur la ligne de métadonnées (hors édition de titre) → ouvre
  l'éditeur label/date.
- Clic sur une pastille → `dispatch({ type: "SET_LABEL", id, label })`
  immédiatement (pas d'attente d'un `Enter`).
- `onChange`/`onBlur`/`Enter`/`Escape` sur l'input date → même mécanique
  que le champ titre, mais dispatch `SET_DUE_DATE`.

Calcul du retard fait dans le composant à partir de `card.dueDate` et
`card.columnId`, pas dans le reducer (c'est un dérivé d'affichage, pas un
état à part).

## Vérification

Le repo n'a **aucune infrastructure de test** (pas de script `test`, ni
vitest ni jest) — vérification manuelle, plus les deux commandes de la CI :

```bash
npm run lint
npm run build
```

Scénarios à repasser à la main dans `npm run dev` :

1. Ouvrir l'éditeur label/date sur une carte → 4 pastilles + champ date apparaissent.
2. Choisir une couleur → la pastille est visible sur la carte après fermeture.
3. Recliquer sur la pastille déjà active → le label est retiré.
4. Choisir une date passée sur une carte en "To Do" → la date s'affiche en couleur d'alerte.
5. Déplacer manuellement (en changeant l'état initial ou via une future feature drag & drop) la même carte en "Done" → l'alerte disparaît.
6. Vider le champ date → l'échéance est retirée, plus d'alerte.
7. `Escape` pendant l'édition → label et date restaurés à leur valeur d'avant ouverture.
8. Éditer le titre (double-clic) et le label/date (clic sur la ligne meta) restent deux états indépendants — ouvrir l'un ne perturbe pas l'autre.

## Notes Git

`board/types.ts` et `board/reducer.ts` sont déjà touchés par l'édition
inline (mergée) et probablement par l'ajout de carte, la suppression et
le drag & drop (en cours sur d'autres branches). Rebase quasi certain au
moment d'ouvrir la PR : garder **tous les variants** de l'union
`BoardAction` et **tous les `case`** du `switch`, puis revérifier
`npm run build` avant de continuer le rebase (`git rebase --continue`,
puis `git push --force-with-lease`).

## Dépendances

Aucune nouvelle dépendance npm. `package.json` et `package-lock.json` ne
doivent pas apparaître dans le diff de la PR.
