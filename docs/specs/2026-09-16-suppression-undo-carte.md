# Feature 4 — Suppression avec confirmation + undo

- **Issue** : [#4](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/4)
- **Branche** : `feature/olivier-suppression-undo`
- **Date** : 2026-09-16

## Objectif

Permettre de supprimer une carte du board, avec un garde-fou double : une
confirmation explicite avant la suppression, puis une fenêtre de rattrapage
après (« Annuler ») au cas où la confirmation aurait été donnée par erreur.

## Hors scope

Décidé explicitement, à ne pas implémenter dans cette PR :

- **Dialogue de confirmation natif (`window.confirm`), pas un modal custom.**
  `DESIGN.md` ne décrit aucun composant modal ; en construire un (focus trap,
  overlay, accessibilité clavier) sort largement du scope d'une suppression de
  carte. `window.confirm()` est moins soigné visuellement mais bloquant et
  accessible nativement. **Point à confirmer en review si le rendu non stylé
  gêne.**
- Suppression multiple / en masse.
- Suppression au clavier (touche `Suppr` carte focusée) — la carte n'est pas
  focusable, comme pour l'édition inline (feature 3).
- Persistance de la suppression au rechargement — c'est la feature 5.
- Historique d'undo multi-niveaux : une seule suppression est « annulable » à
  la fois. Si une deuxième carte est supprimée avant d'avoir annulé la
  première, le toast de la première suppression est remplacé et cette
  suppression devient définitive.

## Comportement attendu

### Déclencher la suppression

Un bouton de suppression (icône, style *ghost* du design system) apparaît sur
la carte au survol, en haut à droite. Cliquer dessus ouvre `window.confirm("Supprimer cette carte ?")`.

- **Annuler la boîte de dialogue** → rien ne se passe, la carte reste intacte.
- **Confirmer** → la carte est retirée du board immédiatement, et un toast
  apparaît en bas de l'écran : « Carte supprimée » avec une action « Annuler ».

### Fenêtre de rattrapage (undo)

Le toast reste affiché **5 secondes** puis disparaît tout seul (comportement
par défaut de `sonner`).

- **Clic sur « Annuler » dans le toast** → la carte est réinsérée exactement à
  sa position d'origine dans la liste (même `columnId`, même rang parmi
  toutes les cartes), pas simplement ajoutée à la fin de sa colonne.
- **Le toast disparaît sans action** → la suppression devient définitive, rien
  d'autre ne se passe (la carte a déjà été retirée du state à la confirmation).

Le titre, l'id et la position de la carte supprimée sont conservés le temps
que le toast est affiché, pour permettre une restauration fidèle.

## Changements par fichier

### `board/types.ts`

Étendre l'union `BoardAction` avec deux variants (suppression et
restauration) :

```ts
export type BoardAction =
  | { type: "NOOP" }
  | { type: "EDIT_CARD"; id: string; title: string }
  | { type: "DELETE_CARD"; id: string }
  | { type: "RESTORE_CARD"; card: Card; index: number };
```

Un variant par ligne, `|` en tête de ligne, comme pour `EDIT_CARD` — pour que
les conflits avec `ADD_CARD` et `MOVE_CARD` se résolvent en gardant toutes les
lignes.

### `board/reducer.ts`

Deux `case` supplémentaires, avant le `default` :

```ts
case "DELETE_CARD":
  return {
    ...state,
    cards: state.cards.filter((card) => card.id !== action.id),
  };
case "RESTORE_CARD":
  return {
    ...state,
    cards: [
      ...state.cards.slice(0, action.index),
      action.card,
      ...state.cards.slice(action.index),
    ],
  };
```

`RESTORE_CARD` réinsère à l'index fourni par l'appelant plutôt que de
recalculer une position : c'est `card.tsx` qui connaît l'index au moment de la
suppression et le transporte dans le toast.

### `components/card.tsx`

Pas de nouvel état local persistant : la logique tient dans le handler du
bouton de suppression.

```ts
function handleDelete() {
  if (!window.confirm("Supprimer cette carte ?")) return;

  const index = cards.findIndex((c) => c.id === card.id); // index global, pas dans la colonne
  dispatch({ type: "DELETE_CARD", id: card.id });

  toast("Carte supprimée", {
    action: {
      label: "Annuler",
      onClick: () => dispatch({ type: "RESTORE_CARD", card, index }),
    },
  });
}
```

`cards` (la liste complète du state, pas seulement celles de la colonne) doit
être accessible ici pour calculer l'index global — `useBoard()` expose déjà
`state.cards`, donc pas de prop supplémentaire à faire remonter.

Le bouton de suppression : icône `×` ou équivalent SVG minimal, style *ghost*
du design system (fond transparent, texte Telemetry Muted, devient Lunar
Paper au survol), positionné en haut à droite de la carte avec
`opacity-0 group-hover:opacity-100` sur le conteneur (`group` déjà ajoutable
sur le `<div>` racine de la carte) pour n'apparaître qu'au survol de la carte
entière — pas seulement au survol du bouton lui-même.

### `app/layout.tsx`

Ajouter le composant `<Toaster />` de `sonner` dans le `<body>`, une fois pour
toute l'app :

```tsx
import { Toaster } from "sonner";
// ...
<body className="flex min-h-full flex-col bg-ink text-paper">
  {children}
  <Toaster />
</body>
```

## Vérification

Le repo n'a aucune infrastructure de test. La CI ne lance que `lint` et
`build` :

```bash
npm run lint
npm run build
```

Scénarios à repasser à la main dans `npm run dev` :

1. Survoler une carte → le bouton de suppression apparaît ; en sortir → il
   disparaît.
2. Cliquer sur le bouton, annuler la boîte de dialogue → la carte reste.
3. Cliquer sur le bouton, confirmer → la carte disparaît, le toast apparaît.
4. Cliquer sur « Annuler » dans le toast → la carte réapparaît exactement à sa
   position d'origine (même colonne, même rang relatif aux autres cartes).
5. Laisser le toast s'éteindre sans cliquer → la carte reste supprimée.
6. Supprimer deux cartes coup sur coup avant d'annuler la première → seul le
   toast de la deuxième suppression permet d'annuler ; la première est
   définitive.
7. Le reste du board (autres colonnes, compteurs, recherche) reste correct
   après une suppression.

## Notes Git

`board/types.ts` et `board/reducer.ts` sont touchés par 5 des 7 features de
l'atelier. `main` contient déjà `EDIT_CARD` (feature 3) au moment de la
création de cette branche ; d'ici la fin de cette PR, `ADD_CARD` (feature 2)
aura probablement aussi été mergée. Il faudra donc rebaser et résoudre un
conflit sur ces deux fichiers.

Règle de résolution : **garder les deux côtés** — tous les variants de
l'union dans `types.ts`, tous les `case` dans le `switch` du reducer. Revérifier
`npm run build` avant de continuer le rebase, puis pousser avec
`--force-with-lease`.

## Dépendances

`sonner` — bibliothèque de toasts, ajoutée via `npm install sonner`.
