# Feature 5 — Persistance localStorage

- **Issue** : [#5](https://github.com/BrianRid/ProductBuilderToTheMoon/issues/5)
- **Branche** : `feature/thomas-localstorage`
- **Date** : 2026-09-16

## Objectif

Le board conserve automatiquement son état dans le navigateur afin que la
personne retrouve ses cartes après un rechargement ou une nouvelle visite.
Lorsque plusieurs onglets sont ouverts sur le board, une modification faite
dans un onglet est également reflétée dans les autres.

## Hors scope

- La fusion carte par carte de modifications concurrentes : la dernière
  sauvegarde reçue remplace l'état courant en entier.
- Le versionnage et la migration d'anciens formats de données : une valeur
  incompatible est ignorée au profit de l'état initial.
- La persistance sur un serveur ou le partage entre navigateurs et appareils :
  les données restent locales au navigateur.
- Le chiffrement des données : le board ne contient pas de donnée sensible et
  `localStorage` n'est pas un stockage sécurisé.
- L'affichage d'un message d'erreur lorsque le stockage est indisponible ou
  plein : le board reste utilisable en mémoire.
- L'ajout d'un framework de test : la feature est vérifiée avec les commandes
  de CI existantes et des scénarios manuels ciblés.

## Comportement attendu

La feature utilise la clé `product-builder-to-the-moon:board` et y sérialise
l'état complet du board au format JSON.

Au premier rendu, le board affiche `initialBoardState`. Après le montage du
`BoardProvider` dans le navigateur :

1. si la clé est absente, l'état initial est conservé ;
2. si la clé contient un état valide, celui-ci remplace l'état initial ;
3. si la valeur n'est pas du JSON valide, si sa structure est incompatible ou
   si l'accès à `localStorage` échoue, l'état initial est conservé sans faire
   planter l'application.

Un état stocké est valide uniquement s'il s'agit d'un objet contenant une
propriété `cards` sous forme de tableau. Chaque carte doit contenir :

- un `id` de type chaîne non vide ;
- un `title` de type chaîne non vide ;
- un `columnId` égal à `todo`, `in-progress` ou `done`.

La sauvegarde commence uniquement après la fin de l'hydratation. Cette garde
empêche l'état initial affiché au premier rendu d'écraser une sauvegarde avant
qu'elle ait été lue. Chaque changement ultérieur de l'état écrit sa version
complète dans `localStorage`. Une erreur d'écriture est ignorée et le board
continue de fonctionner en mémoire.

Le provider écoute également l'événement `storage` du navigateur :

- une nouvelle valeur valide provenant d'un autre onglet remplace l'état
  courant ;
- une valeur invalide est ignorée ;
- la suppression de la clé depuis un autre onglet rétablit
  `initialBoardState` ;
- les événements concernant une autre clé ou une autre zone de stockage sont
  ignorés.

En cas de modifications presque simultanées, la dernière valeur reçue gagne.
Le bref affichage de l'état initial avant l'hydratation est accepté.

## Changements par fichier

### `board/board-context.tsx`

- Ajouter la constante de clé `product-builder-to-the-moon:board`.
- Ajouter une action interne au contexte pour remplacer l'état lors de
  l'hydratation ou d'un événement `storage`.
- Ajouter un reducer d'adaptation local qui traite cette action interne et
  délègue toutes les actions métier existantes à `boardReducer`.
- Ajouter une fonction de parsing et de validation qui retourne un
  `BoardState` valide ou signale que la valeur doit être ignorée.
- Hydrater l'état dans un effet exécuté uniquement dans le navigateur.
- Sauvegarder l'état dans un second effet, uniquement après l'hydratation.
- Écouter l'événement `storage` et retirer l'écouteur au démontage du provider.
- Entourer les lectures, le parsing et les écritures de protections afin
  qu'une erreur de stockage ne bloque jamais le board.

### `docs/specs/README.md`

- Ajouter le lien vers cette spec dans la ligne de la Feature 5.

`board/types.ts`, `board/reducer.ts` et les composants ne sont pas modifiés.

## Vérification

Les commandes que la CI lance :

```bash
npm run lint
npm run build
```

Scénarios à repasser manuellement dans `npm run dev` :

1. Modifier le board, recharger la page et vérifier que le même état revient.
2. Ouvrir deux onglets, modifier le premier et vérifier que le second se met à
   jour sans rechargement.
3. Modifier successivement les deux onglets et vérifier que la dernière
   sauvegarde reçue remplace l'état précédent.
4. Placer du JSON invalide dans `product-builder-to-the-moon:board`, recharger
   et vérifier que l'état initial apparaît sans erreur visible.
5. Placer un objet dont les cartes ont une structure invalide, recharger et
   vérifier le même retour à l'état initial.
6. Supprimer la clé depuis un autre onglet et vérifier que le board revient à
   `initialBoardState`.
7. Bloquer l'accès à `localStorage`, puis vérifier que le board reste utilisable
   en mémoire et qu'aucune erreur ne casse l'interface.

## Notes Git

Cette feature ne modifie ni `board/types.ts` ni `board/reducer.ts`. Elle évite
donc les principaux points de conflit identifiés pour l'atelier. Un rebase sur
`main` reste recommandé avant la pull request afin de récupérer les nouvelles
actions métier que le `boardReducer` local devra continuer à déléguer.

## Dépendances

Aucune.
