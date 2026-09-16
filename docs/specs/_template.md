# Feature N — <titre>

- **Issue** : [#N](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/N)
- **Branche** : `feature/<ton-nom>-<slug>`
- **Date** : YYYY-MM-DD

## Objectif

Ce que la feature permet de faire, en deux ou trois phrases, du point de vue
de la personne qui utilise le board.

## Hors scope

Ce que tu as délibérément choisi de ne PAS faire, et pourquoi. Cette section
est la plus utile de la spec : elle évite au reviewer de te remonter comme un
oubli ce qui était une décision.

## Comportement attendu

Le détail de l'interaction. Tranche ici tout ce que l'issue laisse ouvert :
cas limites, saisie vide, valeurs invalides, ce qui se passe en cas d'annulation.

## Changements par fichier

### `chemin/du/fichier.ts`

Ce que tu ajoutes ou modifies, avec le bout de code si ça aide.

## Vérification

Les commandes que la CI lance :

```bash
npm run lint
npm run build
```

Puis la liste numérotée des scénarios à repasser à la main dans `npm run dev`.

## Notes Git

`board/types.ts` et `board/reducer.ts` sont touchés par 5 des 7 features. Si ta
feature y touche, note-le ici : tu devras probablement rebaser sur `main` et
résoudre un conflit, en gardant **les deux côtés** (tous les variants de
l'union, tous les `case` du switch).

## Dépendances

Les paquets npm ajoutés, ou « aucune ».
