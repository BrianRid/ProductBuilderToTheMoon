# Workshop Git/GitHub — Product Builder To The Moon

Un board Kanban en React/Next.js, construit collectivement : un socle de base,
puis 7 features (une par participant·e), chacune livrée via une pull request.

L'objectif n'est pas seulement de coder la feature, mais de pratiquer le
workflow Git/GitHub d'une équipe : branche, commit, push, PR, review, merge —
et la résolution de vrais conflits, puisque plusieurs features touchent les
mêmes fichiers centraux (`board/types.ts`, `board/reducer.ts`).

## Setup

```bash
git clone https://github.com/BrianRid/ProductBuilderToTheMoon.git
cd ProductBuilderToTheMoon
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — tu devrais voir 3
colonnes (To Do / In Progress / Done) avec une carte d'exemple dans "To Do".

## Convention de branche

```
feature/<ton-nom>-<slug-de-la-feature>
# ex: feature/brian-drag-and-drop
```

## Le socle

- `board/types.ts` — types `Card`, `ColumnId`, union `BoardAction` (à étendre)
- `board/reducer.ts` — reducer du board (à étendre, un `case` par feature)
- `board/board-context.tsx` — `BoardProvider` + hook `useBoard()`
- `components/board.tsx`, `column.tsx`, `card.tsx` — rendu des colonnes/cartes

Aucune lib de drag & drop ou de toast n'est installée : chaque feature qui en
a besoin l'ajoute elle-même dans sa branche (`npm install <lib>`).

## Les 7 features

| # | Feature | Fichiers touchés | Lib suggérée |
|---|---|---|---|
| 1 | Drag & drop entre colonnes | `board.tsx`, `column.tsx`, `types.ts` (+`MOVE_CARD`), `reducer.ts` | `@dnd-kit/core` |
| 2 | Formulaire d'ajout de carte + validation | nouveau `add-card-form.tsx`, `types.ts`/`reducer.ts` (`ADD_CARD` réel) | — |
| 3 | Édition inline (double-clic) | `card.tsx`, `types.ts` (+`EDIT_CARD`), `reducer.ts` | — |
| 4 | Suppression avec confirmation + undo | `card.tsx`, `types.ts` (+`DELETE_CARD`), `reducer.ts` | `sonner` |
| 5 | Persistance localStorage | `board-context.tsx` (hydratation + sync) | — |
| 6 | Recherche / filtre de cartes | nouveau `search-bar.tsx`, state local | — |
| 7 | Labels colorés + date d'échéance | `types.ts` (extend `Card`), `card.tsx`, `reducer.ts` | — |

Chaque feature a son issue GitHub dédiée avec le détail attendu.

## Ordre de merge suggéré

`types.ts` et `reducer.ts` sont touchés par 5 features sur 7 : si plusieurs PR
sont ouvertes en même temps, tu vas devoir rebaser et résoudre de vrais
conflits. Pour limiter la casse, un ordre de merge raisonnable :

1. Recherche / filtre (n'ajoute aucune action au reducer)
2. Persistance localStorage (ne touche pas `types.ts`/`reducer.ts`)
3. Formulaire d'ajout (`ADD_CARD`)
4. Édition inline (`EDIT_CARD`)
5. Suppression + undo (`DELETE_CARD`)
6. Labels + dates (étend `Card`)
7. Drag & drop (`MOVE_CARD`)

Ce n'est qu'une suggestion : si l'ordre réel diverge, c'est l'occasion de
pratiquer la résolution de conflits ci-dessous.

## Résoudre un conflit sur `types.ts` / `reducer.ts`

1. Récupère les derniers changements de `main` :
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Git va s'arrêter sur les fichiers en conflit. Dans `types.ts`, **garde les
   deux variants** de l'union `BoardAction` (celui déjà mergé + le tien).
   Même logique dans `reducer.ts` : garde les deux `case`, assure-toi que le
   `switch` reste valide.
3. Vérifie que tout compile toujours :
   ```bash
   npm run build
   ```
4. Marque les fichiers résolus et continue le rebase :
   ```bash
   git add board/types.ts board/reducer.ts
   git rebase --continue
   ```
5. Pousse ta branche (le rebase réécrit l'historique, `--force-with-lease`
   est nécessaire) :
   ```bash
   git push --force-with-lease
   ```

## Process de PR

1. Ouvre ta PR vers `main`, remplis le template (checklist incluse)
2. Lie l'issue correspondante (`Closes #...`)
3. Demande une review à un·e autre participant·e
4. La CI doit passer (`lint` + `build`) avant merge
5. Une review approuvée est requise avant de merger
