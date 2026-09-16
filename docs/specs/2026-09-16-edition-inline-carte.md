# Feature 3 — Édition inline d'une carte

- **Issue** : [#3](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/3)
- **Branche** : `feature/sarah-edition-inline`
- **Date** : 2026-09-16

## Objectif

Permettre de modifier le titre d'une carte du board en double-cliquant
dessus : le titre se transforme en champ de saisie, la modification est
enregistrée dans le state global du board, puis le champ redevient du texte.

## Hors scope

Décidé explicitement, à ne pas implémenter dans cette PR :

- **Accès clavier à l'édition.** L'ouverture se fait au double-clic uniquement,
  conformément à l'issue. Une carte n'est pas focusable et il n'existe aucun
  moyen d'entrer en édition sans souris. Limite connue et assumée.
- Édition d'un autre champ que le titre (description, colonne, label).
- Édition simultanée de plusieurs cartes.
- Persistance de la modification au rechargement — c'est la feature 5.

## Comportement attendu

### Entrer en édition

Un double-clic sur le titre d'une carte remplace le `<p>` par un `<input>`
contenant le titre courant. Le champ prend le focus et **son contenu est
sélectionné**, pour qu'un utilisateur qui veut tout réécrire puisse taper
directement.

L'état d'édition est local à la carte : ouvrir l'édition d'une carte ne
touche pas le state global du board et n'affecte aucune autre carte.

### Sortir de l'édition

Trois sorties, deux comportements :

| Geste | Résultat |
|---|---|
| `Enter` | valide |
| Clic en dehors du champ (`blur`) | valide |
| `Escape` | annule |

**Valider** applique la règle de normalisation ci-dessous puis ferme le champ.
**Annuler** ferme le champ en restaurant le titre d'origine, sans rien
enregistrer.

### Normalisation à la validation

À la validation, la saisie passe par `trim()` (les espaces de début et de fin
sont retirés), puis :

- si le résultat est **vide** → rien n'est enregistré et **le champ reste
  ouvert**, bordure rouge et message explicite sous la carte (« Le titre ne
  peut pas être vide — Échap pour annuler ») ; l'erreur se lève dès la
  première frappe, et `Escape` reste la sortie pour abandonner ;
- si le résultat est **identique** au titre actuel → on n'enregistre rien (pas
  d'action inutile envoyée au reducer), le champ se ferme ;
- sinon → l'action `EDIT_CARD` est envoyée avec le titre nettoyé, le champ se
  ferme.

Le rejet d'un titre vide est donc **visible**. La première version revenait
silencieusement au titre d'origine ; à l'usage, cette annulation muette se lit
comme un bug — la saisie disparaît sans explication. Le `DESIGN.md` tranche
d'ailleurs dans le même sens (section Inputs / Fields) : « utiliser un message
textuel explicite en plus d'une variation colorée ».

## Changements par fichier

### `board/types.ts`

Étendre l'union `BoardAction` avec un variant :

```ts
export type BoardAction =
  | { type: "NOOP" }
  | { type: "EDIT_CARD"; id: string; title: string };
```

Le formatage — un variant par ligne, `|` en tête de ligne — est volontaire :
c'est ce qui rendra les conflits avec `ADD_CARD`, `DELETE_CARD` et `MOVE_CARD`
résolubles en gardant simplement toutes les lignes.

### `board/reducer.ts`

Ajouter un `case` dans le `switch`, avant le `default` :

```ts
case "EDIT_CARD":
  return {
    ...state,
    cards: state.cards.map((card) =>
      card.id === action.id ? { ...card, title: action.title } : card,
    ),
  };
```

Mise à jour immuable : on retourne un nouveau tableau et un nouvel objet carte,
on ne mute jamais le state existant. Une carte dont l'`id` ne correspond pas
est retournée telle quelle (même référence), ce qui évite de re-rendre les
autres cartes.

Si aucune carte ne porte l'`id` reçu, le `map` ne remplace rien et le state est
retourné inchangé — pas de cas d'erreur à traiter.

### `components/card.tsx`

Le fichier est déjà dans le boundary client (`components/board.tsx` porte
`"use client"`), donc **aucune directive à ajouter** — seulement des hooks.

Deux états locaux :

- `isEditing: boolean` — affiche l'`<input>` plutôt que le `<p>` ;
- `draft: string` — le texte en cours de saisie, initialisé au titre de la
  carte à chaque ouverture de l'édition.

Une fonction `commit()` porte toute la règle de normalisation décrite plus
haut, et une fonction `cancel()` ferme sans enregistrer. Le câblage :

- `onDoubleClick` sur le titre → ouvre l'édition ;
- `onBlur` sur l'input → `commit()` ;
- `onKeyDown` sur l'input → `Enter` appelle `commit()`, `Escape` appelle
  `cancel()`.

L'input suit la spec « Inputs / Fields » du `DESIGN.md` dans son état focus —
fond Raised Module, bordure Launch Amber, rayon `6px`, anneau ambre translucide.
Des marges négatives compensent son padding pour que le titre reste exactement
à la même position qu'en lecture : la carte ne « saute » pas au passage en
édition.

Le numéro de série (`#01`) reste affiché dans les deux états.

## Vérification

Le repo n'a **aucune infrastructure de test** (pas de script `test`, ni vitest
ni jest). En ajouter une sort du scope de cette PR, dont la CI ne lance que
`lint` et `build`. La vérification est donc manuelle, plus les deux commandes
de la CI.

```bash
npm run lint
npm run build
```

Scénarios à repasser à la main dans `npm run dev` :

1. Double-clic sur le titre → un champ apparaît, focus dedans, texte sélectionné.
2. Taper un nouveau titre + `Enter` → le titre est modifié, le champ se ferme.
3. Rouvrir l'édition + `Escape` → le titre d'origine est conservé.
4. Rouvrir l'édition, modifier, cliquer ailleurs → la modification est enregistrée.
5. Tout effacer + `Enter` → le champ reste ouvert, bordure rouge et message
   d'erreur ; taper un caractère lève l'erreur ; `Escape` ferme et restaure le
   titre d'origine.
6. Saisir `"  du texte  "` + `Enter` → le titre enregistré est `"du texte"`.
7. Valider sans avoir rien changé → le titre est inchangé.
8. Le reste du board (colonnes, compteurs, carte non éditée) n'a pas bougé.

## Notes Git

`board/types.ts` et `board/reducer.ts` sont touchés par 5 des 7 features de
l'atelier. L'ordre de merge suggéré par le `WORKSHOP.md` place cette feature en
4ᵉ position, après `ADD_CARD` : il faudra donc très probablement rebaser sur
`main` et résoudre un conflit sur ces deux fichiers.

Règle de résolution : **garder les deux côtés** — tous les variants de l'union
dans `types.ts`, tous les `case` dans le `switch` du reducer. Puis revérifier
que `npm run build` passe avant de continuer le rebase.

Le rebase réécrivant l'historique, le push se fera avec `--force-with-lease`.

## Couleur d'erreur

Le `DESIGN.md` exigeait « une variation colorée » pour les erreurs sans définir
aucune couleur d'erreur : sa palette n'avait que Launch Amber (réservé au focus,
donc déjà l'état normal de ce champ) et Mission Complete, que la consigne
interdit explicitement de détourner.

Le manque est comblé dans cette PR, en accord avec Thomas : **Mission Abort**
(`#d9614a`), rouge chaud pour rester dans la famille nocturne de la palette. Le
nom suit la convention du système, où `mission-complete` désigne déjà l'état
positif. Le token est ajouté aux trois sources — `.impeccable/design.json`
(rampe tonale comprise), `DESIGN.md` (palette + section Inputs / Fields) et
`app/globals.css` (`--color-abort`) — et le composant le consomme via
`border-abort` / `text-abort`, sans valeur en dur.

## Dépendances

Aucune nouvelle dépendance npm. `package.json` et `package-lock.json` ne
doivent pas apparaître dans le diff de la PR.
