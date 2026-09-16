---
name: Product Builder To The Moon
description: Un centre de contrôle orbital chaleureux pour piloter le travail d’une équipe.
colors:
  space-ink: "#14120f"
  command-panel: "#1c1a16"
  raised-module: "#242019"
  structural-line: "#3a3226"
  lunar-paper: "#f3ede2"
  telemetry-muted: "#9c9284"
  launch-amber: "#ffb454"
  mission-complete: "#7c9473"
typography:
  title:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0"
  control: "6px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  card:
    backgroundColor: "{colors.raised-module}"
    textColor: "{colors.lunar-paper}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  status-pill:
    backgroundColor: "rgb(255 180 84 / 0.1)"
    textColor: "{colors.launch-amber}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  button-primary:
    backgroundColor: "{colors.launch-amber}"
    textColor: "{colors.space-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.raised-module}"
    textColor: "{colors.lunar-paper}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: Product Builder To The Moon

## Overview

**Creative North Star: "Orbital Mission Control"**

Product Builder To The Moon ressemble à un centre de contrôle orbital conçu pour une équipe produit : précis, concentré et technique, sans devenir froid. Le fond presque noir et les surfaces brunes créent un environnement calme ; l’ambre agit comme un signal rare qui guide vers l’activité en cours.

L’interface privilégie une densité utile, des séparations structurelles nettes et une typographie compacte. Les composants restent sobres au repos. Les interactions les plus importantes gagnent une légère élévation, comme des modules que l’on active sur une console.

**Key Characteristics:**

- Palette nocturne chaude, jamais bleutée ni clinique.
- Ambre réservé aux signaux actifs, aux actions principales et aux états de focus.
- IBM Plex Sans pour la lecture, IBM Plex Mono pour la télémétrie et les identifiants.
- Géométrie principalement rectiligne, adoucie seulement pour les contrôles et les statuts.
- Profondeur discrète : structure tonale au repos, légère élévation pour les cartes interactives.

## Colors

La palette associe des neutres chauds très sombres à deux signaux désaturés : un ambre énergique pour l’action et un vert calme pour l’accomplissement.

### Primary

- **Launch Amber** (`#ffb454`): accent principal pour l’activité en cours, les actions prioritaires, les indicateurs actifs, le focus et le liseré supérieur de l’application.

### Secondary

- **Mission Complete** (`#7c9473`): indique exclusivement une progression terminée ou un état positif stabilisé.

### Neutral

- **Space Ink** (`#14120f`): fond global et texte sombre sur l’ambre.
- **Command Panel** (`#1c1a16`): surface principale des colonnes.
- **Raised Module** (`#242019`): cartes, champs et surfaces interactives surélevées.
- **Structural Line** (`#3a3226`): séparateurs, bordures et états inactifs.
- **Lunar Paper** (`#f3ede2`): texte principal à fort contraste.
- **Telemetry Muted** (`#9c9284`): métadonnées, compteurs et texte secondaire.

**The Signal Scarcity Rule.** Launch Amber doit rester rare : il indique une action, un focus ou une activité réelle, jamais une décoration de fond.

## Typography

**Display Font:** IBM Plex Sans (avec `ui-sans-serif`, `system-ui`, `sans-serif`)
**Body Font:** IBM Plex Sans (avec `ui-sans-serif`, `system-ui`, `sans-serif`)
**Label/Mono Font:** IBM Plex Mono (avec `ui-monospace`, `monospace`)

**Character:** IBM Plex apporte la rigueur d’une interface d’ingénierie sans sacrifier la chaleur. La variante Mono transforme les nombres, identifiants et états en télémétrie immédiatement reconnaissable.

### Hierarchy

- **Title** (600, `1rem`, `1.5`): nom du produit dans l’en-tête.
- **Section title** (500, `0.875rem`, `1.5`): titres de colonnes et sous-sections opérationnelles.
- **Body** (400, `0.875rem`, `1.5`): titres de cartes, descriptions courtes et contenu courant.
- **Label** (400–500, `0.75rem`, `1.5`): compteurs, statuts et contrôles compacts.
- **Micro telemetry** (400, `0.6875rem`, `1.5`): identifiants de cartes et métadonnées secondaires.

**The Telemetry Rule.** Réserver IBM Plex Mono aux données brèves et scannables ; ne pas l’utiliser pour des paragraphes ou des titres éditoriaux.

## Layout

La page occupe toute la hauteur disponible et se structure en deux bandes : un en-tête compact de `64px` environ, puis un board flexible. Le board utilise trois colonnes de largeur égale, séparées par un trait de `1px`; chaque colonne conserve une largeur minimale de `240px` et le conteneur défile horizontalement lorsque l’espace manque.

La grille d’espacement repose sur des multiples de `4px`. Les zones structurelles utilisent `16px` à `24px`; les composants compacts utilisent `8px` à `12px`. Les cartes s’empilent avec un intervalle de `8px`. Sur petit écran, préserver la largeur lisible des colonnes et préférer le défilement horizontal à leur compression.

## Elevation & Depth

La profondeur combine couches tonales et élévation légère. Les colonnes restent plates et séparées par leur couleur et leurs traits. Les cartes utilisent une ombre chaude, courte et peu opaque pour se détacher du panneau ; au survol ou pendant une interaction, l’ombre augmente légèrement sans effet flottant spectaculaire.

### Shadow Vocabulary

- **Module Rest** (`0 2px 8px rgb(0 0 0 / 0.18)`): cartes et champs interactifs au repos.
- **Module Active** (`0 6px 18px rgb(0 0 0 / 0.24)`): survol, déplacement ou focus d’un module.

**The Controlled Lift Rule.** Seuls les éléments manipulables gagnent une ombre ; la structure du board reste plate afin de préserver la lisibilité.

## Shapes

Les surfaces structurelles et les cartes ont des angles droits. Elles évoquent des panneaux et modules imbriqués. Les contrôles de saisie et boutons peuvent employer un rayon contenu de `6px` pour signaler leur affordance. La forme capsule est réservée aux indicateurs de statut. Une bordure latérale de `2px` sert de repère d’état sur les cartes.

## Components

### Header

- **Structure:** fond Space Ink, bordure inférieure Structural Line et liseré supérieur Launch Amber de `2px`.
- **Spacing:** `16px` verticalement, `24px` horizontalement.
- **Content:** titre compact à gauche, statut global à droite.

### Buttons

- **Shape:** rayon fonctionnel de `6px`.
- **Primary:** fond Launch Amber, texte Space Ink, graisse 600, padding `8px 12px`.
- **Hover / Focus:** légère baisse de luminosité au survol ; focus visible de `2px` en Launch Amber avec un offset de `2px`.
- **Secondary:** fond Raised Module, texte Lunar Paper, bordure Structural Line.
- **Ghost:** fond transparent, texte Telemetry Muted ; devient Lunar Paper au survol.

### Cards / Containers

- **Corner Style:** angles droits.
- **Background:** Raised Module sur Command Panel.
- **Shadow Strategy:** Module Rest, puis Module Active lors d’une interaction.
- **Border:** repère latéral Structural Line de `2px`, remplacé par Launch Amber au survol ou pendant le déplacement.
- **Internal Padding:** `10px 12px` ; métadonnée séparée du titre par `4px`.

### Inputs / Fields

- **Style:** fond Raised Module, bordure Structural Line, rayon `6px`, texte Lunar Paper.
- **Focus:** bordure Launch Amber et anneau externe ambre translucide.
- **Placeholder / Disabled:** Telemetry Muted ; réduire l’opacité sans faire disparaître la bordure.
- **Error:** utiliser un message textuel explicite en plus d’une variation colorée ; ne jamais détourner Mission Complete.

### Status Pill

- **Style:** capsule, fond Launch Amber à 10 %, bordure ambre à 30 %, texte et point actif Launch Amber.
- **Typography:** nombre en IBM Plex Mono tabulaire ; libellé en IBM Plex Sans.
- **Usage:** un résumé d’état global, jamais un bouton principal.

### Board Column

- **Structure:** barre d’état supérieure de `2px`, en-tête avec titre et compteur, puis pile de cartes.
- **Counter:** deux chiffres minimum, IBM Plex Mono, couleur Telemetry Muted.
- **Empty state:** conserver la surface calme et ajouter une instruction courte ; ne pas remplir l’espace par une illustration décorative.

## Do's and Don'ts

### Do:

- **Do** préserver le contraste Lunar Paper sur les fonds sombres et Telemetry Muted uniquement pour le contenu secondaire.
- **Do** utiliser des multiples de `4px` et conserver le rythme compact du board.
- **Do** associer toute couleur d’état à un libellé, un symbole ou une position reconnaissable.
- **Do** employer l’élévation uniquement pour indiquer qu’un module peut être manipulé.
- **Do** maintenir une largeur minimale de `240px` par colonne sur les petits écrans.

### Don't:

- **Don't** étendre Launch Amber à de grandes surfaces ou à des éléments purement décoratifs.
- **Don't** introduire des dégradés, du glassmorphism ou des ombres bleutées dans cet univers chaud et matériel.
- **Don't** arrondir systématiquement les cartes et panneaux ; les angles droits font partie de l’identité.
- **Don't** utiliser IBM Plex Mono pour de longues phrases.
- **Don't** compresser les colonnes au point de nuire à la lecture ; autoriser le défilement horizontal.
