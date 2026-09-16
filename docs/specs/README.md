# Specs des features

Un dossier partagé où chacun·e dépose la spec de sa feature avant de coder.

Écrire la spec avant l'implémentation force à trancher les questions que
l'issue ne tranche pas (que faire d'un titre vide ? valider au clic en dehors
ou pas ?). Ça évite de découvrir le problème au milieu du dev, et ça donne au
reviewer le « pourquoi » derrière le code.

## Convention de nommage

```
docs/specs/YYYY-MM-DD-<slug-de-la-feature>.md
```

Exemple : `docs/specs/2026-09-16-edition-inline-carte.md`

## Comment procéder

1. Copie `_template.md` sous le nom de ta feature.
2. Remplis-le avant d'écrire la moindre ligne de code.
3. Commite-le **dans la PR de ta feature**, pas séparément : la spec et le
   code qu'elle décrit se relisent ensemble.

## Les specs

| # | Feature | Spec |
|---|---|---|
| 1 | Drag & drop entre colonnes | — |
| 2 | Formulaire d'ajout de carte | [2026-09-16-formulaire-ajout-carte.md](./2026-09-16-formulaire-ajout-carte.md) |
| 3 | Édition inline d'une carte | [2026-09-16-edition-inline-carte.md](./2026-09-16-edition-inline-carte.md) |
| 4 | Suppression avec confirmation + undo | [2026-09-16-suppression-undo-carte.md](./2026-09-16-suppression-undo-carte.md) |
| 5 | Persistance localStorage | [2026-09-16-persistance-localstorage.md](./2026-09-16-persistance-localstorage.md) |
| 6 | Recherche / filtre de cartes | [2026-09-16-recherche-filtre-cartes.md](./2026-09-16-recherche-filtre-cartes.md) |
| 7 | Labels colorés + date d'échéance | — |

Ajoute la ligne de ta feature dans ce tableau quand tu déposes ta spec.
