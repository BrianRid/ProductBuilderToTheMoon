# Feature 2 — Formulaire d'ajout de carte

- **Issue** : [#2](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/2)
- **Branche** : `feature/omar-formulaire-ajout-carte`
- **Date** : 2026-09-16

## Objectif

Permettre de créer ses propres cartes. Aujourd'hui le board se regarde : il
affiche une carte d'exemple que personne n'a écrite, et aucun geste ne permet
d'en ajouter une. Un bouton en bas de la colonne **To Do** se déplie en
formulaire, on saisit un titre, la carte apparaît dans la colonne — et le champ
reste prêt pour la suivante.

## Hors scope

Décidé explicitement, à ne pas implémenter dans cette PR :

- **Choisir la colonne à la création.** L'issue dit To Do ; un sélecteur ferait
  doublon avec le drag & drop de la feature 1.
- **Description, labels, date d'échéance.** C'est la feature 7, qui étend
  l'interface `Card`.
- **Réordonner les cartes.** Aucune feature de l'atelier ne le demande ;
  l'insertion se fait en fin de colonne.
- **Annuler un ajout.** L'undo arrive avec la suppression, feature 4.
- **Survivre au rechargement.** C'est la feature 5.
- **Modifier `components/card.tsx`.** Conséquence directe du choix
  d'identifiant, expliqué plus bas.
- **Ajouter une couleur au design system.** `DESIGN.md` ne contient aucun jeton
  d'erreur. Plutôt que d'en introduire un, l'erreur est signalée dans la
  palette existante — voir « Signaler l'erreur sans jeton dédié ».

## Comportement attendu

### Ouvrir le formulaire

Au repos, la colonne To Do — et elle seule — porte sous sa pile de cartes un
bouton discret `+ Ajouter une carte`. Les deux autres colonnes ne changent pas.

Au clic, le bouton **devient** le formulaire : un champ de titre qui prend le
focus, un bouton `Ajouter`, et la mention `Échap`. L'état ouvert/fermé est
local au formulaire : il ne touche pas le state global du board.

### Créer une carte

`Enter` dans le champ ou un clic sur `Ajouter` déclenche la même validation.
La saisie passe d'abord par `trim()`, puis :

- si le résultat est **vide** → rien n'est créé, une erreur s'affiche (voir
  plus bas), le focus revient dans le champ ;
- sinon → l'action `ADD_CARD` part vers le reducer avec le titre nettoyé.

La carte apparaît **en fin de colonne To Do**, donc juste au-dessus du
formulaire : là où le regard est déjà posé. Le compteur de la colonne et le
« cartes en vol » de l'en-tête suivent sans traitement particulier, ils
dérivent déjà du state.

Le champ se vide et **garde le focus** : on enchaîne plusieurs cartes sans
jamais toucher la souris. Le formulaire reste ouvert jusqu'à ce qu'on le ferme.

### Fermer le formulaire

| Geste | Résultat |
|---|---|
| `Échap` | ferme, vide le champ, efface l'erreur, rend le focus au bouton |
| Clic sur le bouton `+ Ajouter une carte` | ouvre |
| Clic **en dehors** du formulaire | ne ferme pas |

Le clic en dehors est volontairement inerte, et c'est un écart assumé avec
l'édition inline de la feature 3, où le `blur` valide. Les deux gestes ne
portent pas le même risque : abandonner l'édition d'un titre existant ne perd
qu'une correction, tandis que fermer sur `blur` un formulaire de création
jetterait une saisie qui n'existe nulle part ailleurs. Un clic distrait dans la
colonne ne doit pas effacer ce qu'on vient de taper.

### Les règles de saisie

| Situation | Comportement |
|---|---|
| Titre vide, ou uniquement des espaces | Erreur affichée, focus renvoyé dans le champ, **aucune carte créée** |
| L'erreur est visible et la personne se remet à taper | Le message disparaît immédiatement — on ne laisse pas un reproche à l'écran une fois corrigé |
| Espaces en début ou fin | Retirés avant la validation **et** avant le stockage |
| Longueur | 120 caractères maximum, bloqués à la saisie par `maxLength`. Jamais de troncature silencieuse après coup |
| Deux cartes de même titre | Autorisé. Aucune règle d'unicité : c'est un board, pas un registre |

### Signaler l'erreur sans jeton dédié

`DESIGN.md` demande, pour un champ en erreur, « un message textuel explicite en
plus d'une variation colorée ; ne jamais détourner Mission Complete ». Mais la
palette ne contient pas de couleur d'erreur : Launch Amber (action, focus),
Mission Complete (terminé) et cinq neutres.

Le design system est pris **tel quel**, sans jeton ajouté. La variation colorée
porte donc sur le **message**, affiché en Launch Amber sous le champ ; la
bordure du champ garde son traitement de focus habituel. Mettre l'ambre sur la
bordure aurait rendu l'erreur indistinguable du focus, précisément au moment où
l'on renvoie le focus dans le champ.

Message : `Un titre est nécessaire pour créer la carte.`

Si une feature ultérieure a besoin d'un vrai état d'erreur coloré — la
suppression (4) ou les échéances dépassées (7) — le sujet devra être porté au
design system, pas résolu dans un coin.

### Accessibilité

- `<label>` réel, masqué visuellement — pas un `placeholder` en guise
  d'étiquette ;
- `aria-invalid` sur le champ quand l'erreur est active ;
- `aria-describedby` reliant le champ à son message d'erreur ;
- message en `role="alert"`, annoncé sans déplacer le focus ;
- le bouton `Ajouter` reste **actif en permanence**. Un bouton désactivé
  n'explique pas pourquoi il l'est, et disparaît de la navigation clavier de
  certains lecteurs d'écran.

### Formulaire et recherche

La feature 6 (recherche / filtre), mergée avant celle-ci, fait passer les
cartes par un filtre dans `components/board.tsx` avant de les distribuer aux
colonnes. Une carte créée pendant qu'un filtre est actif serait donc créée pour
de bon, mais **invisible** si son titre ne correspond pas à la recherche.

Pour ne pas produire ce mensonge, le bouton et le formulaire ne sont **pas
rendus tant qu'une recherche est active**. Une colonne filtrée est une vue, pas
un endroit où ajouter. Dès que le champ de recherche est vidé, le bouton
revient.

## Changements par fichier

### `board/types.ts`

Étendre l'union `BoardAction` avec un variant, en conservant les existants :

```ts
export type BoardAction =
  | { type: "NOOP" }
  | { type: "EDIT_CARD"; id: string; title: string }
  | { type: "ADD_CARD"; title: string };
```

Le `NOOP` est **conservé**. Il ne sert plus à rien fonctionnellement, mais la
feature 3 l'a gardé en ajoutant son variant à côté, et le `WORKSHOP.md` demande
de garder les deux côtés lors des résolutions de conflits. Le supprimer ici
créerait un conflit gratuit pour les quatre features qui rebaseront ensuite.

L'action ne transporte que le titre : la colonne (`todo`) et l'identifiant sont
décidés par le reducer, qui est le seul à connaître l'état existant.

### `board/reducer.ts`

Ajouter un `case` dans le `switch`, avant le `default` :

```ts
case "ADD_CARD": {
  const lastSerial = state.cards.reduce((max, card) => {
    const serial = Number(card.id.replace(/\D/g, ""));
    return Number.isFinite(serial) && serial > max ? serial : max;
  }, 0);

  return {
    ...state,
    cards: [
      ...state.cards,
      { id: `card-${lastSerial + 1}`, title: action.title, columnId: "todo" },
    ],
  };
}
```

Mise à jour immuable : un nouveau tableau, jamais de `push` sur l'existant.
L'ajout se fait en fin de tableau, ce qui place la carte en bas de sa colonne —
`components/column.tsx` rend les cartes dans l'ordre du tableau.

Le reducer suppose que le titre reçu est déjà nettoyé : la normalisation est
faite dans le formulaire, avant le `dispatch`. Le reducer ne reçoit jamais
d'action pour un titre vide.

#### Pourquoi l'identifiant est une décision visible à l'écran

`components/card.tsx` n'affiche pas un numéro stocké : il l'**extrait des
chiffres de l'id**.

```ts
const serial = card.id.replace(/\D/g, "").padStart(2, "0");
```

Un `crypto.randomUUID()` afficherait donc `#7941028366…` ou `#00` sous chaque
carte créée, et obligerait à réécrire `card.tsx` — un fichier que la feature 3
vient de retravailler en profondeur et que les features 4 et 7 vont toucher.
La suite continue préserve la grammaire visuelle du board (`#01`, `#02`, `#03`)
et laisse `card.tsx` intact.

**Limite assumée** : quand la feature 4 (suppression) sera mergée, supprimer la
carte au plus grand numéro libérera ce numéro, qui sera réattribué au prochain
ajout. Un compteur monotone dans `BoardState` le corrigerait, mais il
contraindrait la feature 5, qui sérialise cet état. Le prix n'est pas payé
maintenant.

### `components/add-card-form.tsx` — nouveau

Porte tout l'état local et toute la validation. Le fichier est dans le boundary
client (`components/board.tsx` a `"use client"`), donc aucune directive à
ajouter.

Trois états locaux :

- `isOpen: boolean` — bouton ou formulaire ;
- `title: string` — la saisie en cours ;
- `error: string | null` — le message, effacé dès la frappe suivante.

Le câblage : `onSubmit` sur un `<form>` (ce qui donne `Enter` gratuitement),
`onKeyDown` pour `Escape`, et une `ref` sur l'input pour lui rendre le focus
après une erreur comme après un ajout réussi.

Styles repris de `DESIGN.md` sans invention : input en Raised Module, bordure
Structural Line, rayon `6px`, focus en bordure Launch Amber avec anneau
translucide — le même traitement que l'input de la feature 3. Bouton `Ajouter`
en primaire : fond Launch Amber, texte Space Ink, rayon `6px`, padding
`8px 12px`. Bouton au repos en ghost : texte Telemetry Muted qui passe en Lunar
Paper au survol, pour qu'il ne concurrence pas les cartes.

### `components/column.tsx`

Ajouter une prop optionnelle, rendue sous la pile de cartes :

```ts
interface ColumnProps {
  title: string;
  cards: CardType[];
  indicatorClassName: string;
  footer?: ReactNode;
}
```

Une prop générique plutôt qu'un booléen `showAddForm` : `Column` rend ce qu'on
lui donne et ne sait rien du formulaire. Les colonnes qui ne reçoivent pas de
`footer` sont strictement inchangées.

### `components/board.tsx`

Passer le formulaire en `footer`, pour la colonne `todo` seulement et
uniquement hors recherche :

```tsx
footer={column.id === "todo" && !search ? <AddCardForm /> : undefined}
```

`search` est la variable déjà calculée par la feature 6 dans ce composant.

## Vérification

Le repo n'a **aucune infrastructure de test** : pas de script `test`, ni vitest
ni jest. En ajouter une imposerait une dépendance et une convention à toute
l'équipe, ce qui sort du scope de cette PR. La CI ne lance que :

```bash
npm run lint
npm run build
```

Scénarios à repasser à la main dans `npm run dev` :

1. Le bouton `+ Ajouter une carte` apparaît sous **To Do**, et sous aucune
   autre colonne.
2. Clic sur le bouton → le formulaire s'ouvre, le focus est dans le champ.
3. Saisir `Relire la spec` + `Enter` → la carte apparaît en bas de To Do,
   numérotée `#02`.
4. Le compteur de la colonne passe à `02`, l'en-tête affiche `02 cartes en vol`.
5. Enchaîner deux autres cartes sans toucher la souris → `#03`, `#04`.
6. Champ vide + `Enter` → message en ambre, focus dans le champ, **aucune carte
   créée**.
7. Se remettre à taper → le message disparaît immédiatement.
8. Saisir `"  du texte  "` + `Enter` → le titre enregistré est `"du texte"`.
9. Coller un texte de plus de 120 caractères → la saisie s'arrête à 120.
10. Ouvrir le formulaire, taper un début de titre, cliquer dans la colonne à
    côté → le formulaire reste ouvert, la saisie est intacte.
11. `Échap` → le formulaire se referme, le focus revient sur le bouton.
12. Taper une recherche → le bouton disparaît. Vider la recherche → il revient.
13. Double-cliquer une carte créée → l'édition inline de la feature 3
    fonctionne dessus.
14. La carte d'exemple `#01` et les trois colonnes n'ont pas bougé.

## Notes Git

`board/types.ts` et `board/reducer.ts` sont touchés par 5 des 7 features.
Au moment d'écrire cette spec, `EDIT_CARD` (feature 3) est déjà mergée sur
`main` : `ADD_CARD` n'est donc **pas** la première entrée réelle du seam
d'extension, elle vient s'ajouter à une union qui en contient déjà une.

L'ordre de merge suggéré par le `WORKSHOP.md` place cette feature en 3ᵉ
position ; dans les faits elle arrive après les features 3 et 6. Les features
4 (`DELETE_CARD`), 7 (extension de `Card`) et 1 (`MOVE_CARD`) rebaseront
par-dessus.

Règle de résolution, identique à celle de la feature 3 : **garder les deux
côtés** — tous les variants de l'union dans `types.ts`, tous les `case` du
`switch` dans le reducer. Puis revérifier que `npm run build` passe avant de
continuer le rebase.

`components/board.tsx` est également partagé avec la feature 6 (déjà mergée) et
la feature 1 (drag & drop, à venir) : le conflit y est probable aussi.

Le rebase réécrivant l'historique, le push se fait avec `--force-with-lease`.

## Dépendances

Aucune nouvelle dépendance npm. `package.json` et `package-lock.json` ne
doivent pas apparaître dans le diff de la PR.
