# Feature 6 — Recherche / filtre de cartes

| | |
|---|---|
| **Issue** | [#6](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/6) |
| **Branche** | `feature/paul-search-filter` |
| **Auteur** | Paul Ramus |
| **Ordre de merge** | **1er / 7** (cf. WORKSHOP.md) |

## 1. Objectif

Filtrer les cartes affichées sur le board par leur titre, via une barre de
recherche, sans modifier l'état du board.

## 2. Périmètre

**Dedans**

- Une barre de recherche au-dessus des trois colonnes
- Filtrage par titre, insensible à la casse, sur la sous-chaîne saisie
- Un état vide explicite quand aucune carte ne correspond

**Explicitement dehors** — et pourquoi

| Hors périmètre | Raison |
|---|---|
| Persistance du filtre entre deux sessions | Éviterait de toucher `board-context.tsx`, terrain de la feature 5 |
| Recherche par label ou par date | Ces champs n'existent pas encore — ils arrivent avec la feature 7 |
| Debounce de la saisie | Le board tient en mémoire ; optimiser ici serait de la sur-ingénierie |
| Normalisation des accents | Même raison ; à rouvrir si le contenu réel le justifie |
| Filtre par colonne ou par statut | L'issue #6 parle de recherche par titre uniquement |

## 3. Contrat de fichiers

C'est la partie qui intéresse l'équipe : elle dit où je passe et où je ne passe
pas.

**Je touche**

- `components/search-bar.tsx` — **nouveau**, composant présentationnel pur
- `components/board.tsx` — ajout de l'état local et du filtrage

**Je ne touche pas** — libre pour vous, sans risque de conflit avec moi

- `board/types.ts`
- `board/reducer.ts`
- `board/board-context.tsx`
- `components/column.tsx`
- `components/card.tsx`
- `components/status-pill.tsx`
- `app/page.tsx`
- `package.json` / `package-lock.json` (aucune dépendance ajoutée)

`components/board.tsx` est le **seul fichier partagé** de mon diff. Il n'est
disputé qu'avec la feature 1 (drag & drop) — voir §6.

## 4. Comportement

| État | Attendu |
|---|---|
| Champ vide | Toutes les cartes s'affichent, board identique à aujourd'hui |
| Saisie qui correspond | Seules les cartes dont le titre contient la saisie restent |
| Casse différente | `EXEMPLE` et `exemple` donnent le même résultat |
| Espaces autour | La saisie est trimmée avant comparaison |
| Aucune correspondance | Message « Aucune carte ne correspond à « … » », **les trois colonnes restent affichées** à 00 |
| Champ vidé | Retour à l'état initial |

### Trois décisions assumées

Elles ne sont pas dans l'issue : je les tranche ici pour qu'on ne les
redécouvre pas en review.

1. **Les compteurs de colonne affichent le nombre filtré.** Conséquence
   directe du fait que je passe les cartes déjà filtrées à `<Column>`. C'est
   cohérent : le compteur décrit ce qu'on voit.
2. **Le `StatusPill` continue d'afficher le total.** Il lit `state.cards`
   directement depuis le contexte et je ne le modifie pas. Pendant une
   recherche, l'en-tête peut donc afficher « 03 cartes en vol » avec un board
   qui en montre une. C'est voulu : le pill décrit le board, pas la vue.
3. **Le filtre n'est pas persistant.** Il disparaît au rechargement. Le rendre
   persistant supposerait de toucher `board-context.tsx`, que prend la
   feature 5.

Si l'un de ces trois points vous gêne, c'est le moment de le dire — pas après
le merge.

### Conformité au design system

`DESIGN.md` a été mergé sur `main` (PR #8) après l'écriture de cette feature.
La `SearchBar` a été alignée sur la spec **Inputs / Fields** : fond Raised
Module, bordure Structural Line, rayon `6px`, texte Lunar Paper, placeholder
Telemetry Muted, padding `8px 12px`, ombre *Module Rest* au repos, et au focus
une bordure Launch Amber doublée d'un anneau ambre translucide.

## 5. Interactions avec les autres features

Ma feature introduit une situation que le board ne connaissait pas : **une
carte peut être présente dans l'état mais invisible à l'écran.** Cela crée des
cas limites chez d'autres features. Aucun n'est bloquant pour moi ; ils sont
listés pour que chaque auteur·e les traite dans sa propre branche.

| Feature | Situation | Suggestion |
|---|---|---|
| **1 — Drag & drop** | Les index de drop sont calculés sur une liste filtrée, donc potentiellement faux | Calculer la cible sur la liste complète, ou désactiver le drag pendant un filtre actif |
| **2 — Formulaire d'ajout** | Une carte ajoutée pendant un filtre actif peut ne pas correspondre, donc rester invisible — l'ajout semble avoir échoué | Vider le filtre après un ajout réussi |
| **3 — Édition inline** | Éditer un titre pendant un filtre actif fait disparaître la carte en cours de frappe | Ne réappliquer le filtre qu'à la validation, pas à chaque frappe |
| **7 — Labels et dates** | Voudra sûrement chercher aussi par label | Le prédicat est isolé sur une ligne dans `board.tsx` : un `\|\|` suffit |
| **4 — Suppression + undo** | Aucune interaction | — |
| **5 — Persistance localStorage** | Aucune interaction : le filtre n'est pas persisté | — |

## 6. Handoff vers la feature 1 (drag & drop)

C'est le seul conflit réel attendu sur tout l'atelier me concernant. Je merge
en premier, donc c'est la feature 1 qui rebasera.

Après mon merge, dans `components/board.tsx` :

- le JSX n'itère plus sur `state.cards` mais sur `visibleCards`
- le `<div>` qui contient les colonnes est **inchangé** : mêmes classes, même
  `COLUMNS.map`, seule la source des cartes diffère

Au rebase : garder ma ligne `visibleCards.filter(...)` et placer le
`DndContext` autour de ce `<div>`. J'ai gardé ce bloc structurellement
identique exprès pour que la résolution tienne en une ligne.

## 7. Definition of done

Alignée sur la checklist du template de PR et sur la CI (`lint` + `build`).

- [x] `npm run lint` passe
- [x] `npm run build` passe
- [x] Le board existant fonctionne à l'identique quand le champ est vide
- [x] Les six états du §4 vérifiés dans un navigateur
- [x] Aucune dépendance ajoutée
- [x] Aucune modification de `types.ts` ni de `reducer.ts`, conformément à l'issue #6
- [x] `SearchBar` conforme à la spec Inputs / Fields de `DESIGN.md`
- [ ] Branche à jour avec `main` au moment du merge
- [ ] Une review approuvée
