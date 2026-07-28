---
title: "Pourquoi votre suivi d’activité invente des journées de 23 heures"
description: "Une journée de travail de 23 heures devrait déclencher une alerte. Pourtant, dans beaucoup de systèmes de suivi d’activité, elle devient une ligne de rapport parfaitement…"
pubDate: 2026-10-20T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Une journée de travail de 23 heures devrait déclencher une alerte. Pourtant, dans beaucoup de systèmes de suivi d’activité, elle devient une ligne de rapport parfaitement ordinaire : une application est restée au premier plan pendant plusieurs heures, un client de messagerie a reçu des événements toute la journée, un outil de maintenance s’est réveillé à intervalles réguliers, et quelques traces de développement se sont ajoutées au total. La machine additionne tout et conclut : 23 heures d’activité.

Le calcul peut être exact tout en étant complètement faux.

Ce paradoxe vient d’une confusion fondamentale : une trace informatique n’est pas une unité de travail. Elle indique qu’un événement a été observé, dans un contexte donné, par un capteur donné. Transformer cette observation en charge, en productivité ou en temps facturable exige un modèle d’interprétation. Sans lui, le tableau de bord ne mesure pas le travail ; il mesure la propension des logiciels à laisser des traces.

## Le mauvais réflexe : convertir chaque intervalle en travail

Le piège commence souvent par une règle apparemment raisonnable : si une fenêtre est active entre 10 h 00 et 10 h 30, enregistrons trente minutes. Si une autre source signale un événement pendant cette période, ajoutons-le également. Puis regroupons les événements proches en « sessions » afin d’obtenir une chronologie lisible.

Trois biais apparaissent immédiatement.

D’abord, **être au premier plan ne signifie pas être utilisé**. Une fenêtre de mise à jour, une console d’administration ou un document peuvent rester ouverts pendant que la personne déjeune, téléphone ou travaille sur un autre appareil.

Ensuite, **un événement ponctuel ne décrit pas sa durée**. La réception d’un message prouve qu’un système a reçu un message, pas qu’un humain a consacré une minute — encore moins toute la période environnante — à le traiter.

Enfin, **les sources se chevauchent**. Un éditeur, un navigateur, un dépôt Git et un agenda peuvent tous décrire la même séquence de travail. Additionner leurs durées revient à compter plusieurs fois la même réalité.

Le résultat est une chronologie qui paraît précise parce qu’elle contient des heures, des minutes et des noms d’applications. Mais cette précision est cosmétique. Un relevé récent pouvait ainsi couvrir presque toute une journée, principalement à cause de longues plages attribuées à un outil de mise à jour, alors qu’aucun dépôt, projet ou ticket ne corroborait ces plages. Le problème n’était pas une erreur d’addition : c’était une erreur de catégorie.

## Le bon modèle mental : des capteurs, des hypothèses et des preuves

Un suivi d’activité fiable ressemble moins à un chronomètre qu’à un système de fusion de capteurs.

Chaque source produit une **observation** : changement de fenêtre, frappe clavier, commit, rendez-vous, message reçu, modification de fichier. Cette observation soutient ensuite une ou plusieurs **hypothèses** : travail actif, lecture, réunion, maintenance automatique, inactivité ou état indéterminé. Enfin, le système cherche des **preuves convergentes** avant de convertir l’hypothèse en session exploitable.

On peut résumer le modèle en trois couches :

1. **Observation** — ce que le capteur sait réellement : « cette fenêtre était au premier plan », « ce commit existe », « cet événement a été reçu ».
2. **Interprétation** — ce que l’on suppose : « une tâche de développement était probablement en cours ».
3. **Décision** — ce que l’on ose en déduire : « cette séquence peut contribuer au bilan d’activité », voire « elle est candidate à la facturation ».

Plus la décision est sensible, plus le niveau de preuve doit être élevé. Une trace peut suffire pour aider quelqu’un à reconstruire sa journée. Elle ne suffit pas nécessairement pour évaluer sa productivité, répartir un coût ou établir une facture.

Cette séparation évite une erreur fréquente : présenter une inférence comme un fait. Le système ne devrait pas dire « 160 minutes travaillées » lorsqu’il sait seulement qu’une fenêtre est restée visible pendant 160 minutes. Il devrait dire « intervalle observé de 160 minutes, activité humaine non corroborée ».

## Construire une chronologie plausible plutôt qu’un total maximal

Une bonne chronologie n’essaie pas de conserver le plus de temps possible. Elle cherche l’explication la plus plausible des signaux disponibles.

Cela implique d’abord de travailler sur **l’union temporelle** des événements, et non sur leur somme brute. Si trois sources couvrent la même demi-heure, la durée physique reste trente minutes. Les sources supplémentaires augmentent la confiance ; elles ne créent pas du temps.

Il faut ensuite distinguer plusieurs états :

- **actif corroboré** : interactions récentes et signal de production cohérent ;
- **actif probable** : une source crédible, mais peu de corroboration ;
- **passif** : lecture, vidéo, réunion ou attente, légitimes mais difficiles à mesurer par interaction ;
- **maintenance** : mise à jour, synchronisation ou tâche automatisée ;
- **inactif** : absence prolongée de signaux humains ;
- **indéterminé** : données insuffisantes ou contradictoires.

L’état « indéterminé » est essentiel. Un système qui refuse l’incertitude finit toujours par fabriquer de la certitude. Mieux vaut exposer une plage ambiguë que l’affecter arbitrairement à un projet.

Enfin, des **bornes de plausibilité** doivent protéger l’agrégation. Une application connue pour fonctionner sans intervention humaine ne devrait pas générer plusieurs heures de travail sans autre signal. Une session très longue sans frappe, changement de contexte, production ou événement métier doit être segmentée, plafonnée ou déclassée. Ces règles ne prouvent pas ce qui s’est passé ; elles empêchent au moins les conclusions les moins crédibles.

## Cinq critères pour savoir si le système mérite votre confiance

Avant d’utiliser un suivi d’activité pour piloter une équipe ou alimenter une facturation, cinq questions suffisent à révéler sa maturité.

### 1. Conserve-t-il la provenance ?

Chaque durée doit pouvoir être reliée aux observations qui l’ont produite. Sans cette traçabilité, impossible de distinguer donnée brute, règle automatique et correction humaine.

### 2. Gère-t-il les chevauchements ?

Le total d’une journée ne doit pas être la somme naïve des applications. Le système doit fusionner les intervalles concurrents et expliquer comment il choisit leur attribution.

### 3. Exprime-t-il l’incertitude ?

Une étiquette de confiance, accompagnée de sa raison, vaut mieux qu’un nombre faussement précis. « Projet probable, signal Git et fenêtre cohérente » est exploitable ; « 2 h 37 » sans justification ne l’est pas.

### 4. Sépare-t-il activité et facturation ?

Le temps observé, le temps de travail reconstruit et le temps facturable sont trois objets différents. Le dernier dépend d’un contrat, d’un périmètre et souvent d’une validation humaine — pas seulement de la télémétrie.

### 5. Permet-il la contestation ?

La personne concernée doit pouvoir corriger, exclure ou reclasser une séquence. La correction n’est pas un échec de l’automatisation : c’est une source de vérité indispensable et un moyen d’améliorer les règles futures.

## La mesure ne doit pas devenir une surveillance décorée de chiffres

Ces garde-fous ont une portée plus large que la qualité des rapports. Dès qu’une organisation confond traces numériques et travail, elle incite à optimiser les signaux plutôt que les résultats : garder une fenêtre ouverte, produire des événements visibles, fragmenter son activité pour alimenter le tableau de bord.

Le problème devient alors managérial. Les métiers de connaissance comportent de la réflexion, des conversations, des lectures et des décisions dont la valeur n’est pas proportionnelle au nombre de frappes clavier. La télémétrie peut aider à retrouver le contexte, détecter les oublis et réduire la saisie manuelle. Elle ne constitue pas une mesure universelle de la contribution.

Le meilleur suivi d’activité est donc modeste dans ses affirmations. Il automatise la collecte, rend ses inférences inspectables, signale ses zones d’ombre et réserve les décisions sensibles à des règles explicites ou à une validation humaine.

Une journée de 23 heures n’est pas la preuve d’un engagement exceptionnel. C’est un test de qualité du système de mesure. S’il l’accepte sans sourciller, ne demandez pas encore ce qu’il révèle sur le travail : demandez d’abord ce qu’il comprend de ses propres données.
