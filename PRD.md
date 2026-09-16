# PRD — Product Builder To The Moon

## 1. Contexte

Board Kanban léger destiné à des équipes ou individus qui veulent suivre l'avancement de leurs tâches en trois étapes (À faire / En cours / Terminé), sans la lourdeur d'outils comme Jira ou Trello. La version actuelle constitue le socle technique du MVP : une base fonctionnelle sur laquelle viendront se greffer les fonctionnalités attendues par les premiers utilisateurs avant une mise en production.

## 2. Utilisateurs cibles

Petites équipes ou utilisateurs individuels cherchant un outil de gestion de tâches simple, rapide à prendre en main, sans compte complexe ni configuration lourde. Aucun persona détaillé (rôle, secteur d'activité) n'est encore défini.

## 3. Périmètre actuel (MVP livré)

### 3.1 Écran unique
Une page unique avec :
- Un **header** : nom du produit + un compteur global de cartes ("N carte(s) en vol").
- Un **board** à 3 colonnes fixes : **À faire**, **En cours**, **Terminé**.

### 3.2 Colonnes
- Indicateur de couleur en haut de colonne (statut visuel).
- Titre + compteur de cartes de la colonne.
- Liste des cartes qui lui appartiennent (aucun tri particulier — ordre d'insertion).

### 3.3 Cartes
- Titre affiché.
- Un identifiant visuel (numéro de série court).
- Aucune interaction : pas de clic, pas de déplacement, pas d'édition, pas de suppression.

### 3.4 Données
- Une seule carte d'exemple pré-chargée au démarrage.
- Aucune action utilisateur ne peut créer, modifier, déplacer ou supprimer une carte à ce stade.
- Aucune persistance : l'état vit en mémoire, perdu au rafraîchissement de la page.

## 4. Hors périmètre actuel (backlog produit)

| Capacité manquante | Pourquoi c'est bloquant pour un vrai produit |
|---|---|
| Déplacer une carte entre colonnes (drag & drop) | Fonctionnalité cœur d'un Kanban — sans elle, aucune tâche ne peut progresser |
| Créer une carte | Impossible d'ajouter une tâche réelle |
| Modifier le titre d'une carte | Pas de correction possible après création |
| Supprimer une carte (+ annulation) | Pas de nettoyage possible, et risque de suppression accidentelle sans recours |
| Persistance des données | Perte de tout au rafraîchissement — inacceptable en usage réel |
| Recherche / filtre de cartes | Indispensable dès que le volume de tâches grandit |
| Labels colorés + date d'échéance | Priorisation et catégorisation des tâches |

Périmètre validé tel quel — pas d'autre capacité (multi-utilisateurs, authentification, multi-boards, notifications, export...) prévue pour l'instant.
