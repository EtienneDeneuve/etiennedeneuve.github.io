---
title: "Pourquoi le temps d’écran ne mesure pas le temps de travail"
description: "Un ordinateur peut enregistrer vingt-trois heures d’activité au cours d’une journée sans que personne ait travaillé vingt-trois heures. Une mise à jour laissée en arrière-plan,…"
pubDate: 2027-01-26T09:00:00.000Z
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


Un ordinateur peut enregistrer vingt-trois heures d’activité au cours d’une journée sans que personne ait travaillé vingt-trois heures. Une mise à jour laissée en arrière-plan, un écran de connexion ouvert toute la nuit ou un processus qui maintient une fenêtre active suffisent à produire un journal apparemment continu.

Cette absurdité visible révèle un problème plus profond : nous confondons facilement ce qu’un système sait observer avec ce que nous voulons comprendre. Or un poste sait détecter des fenêtres, des applications, des événements et des changements d’état. Il ne sait pas, à lui seul, reconnaître du travail.

Le temps d’écran est donc une donnée de télémétrie. Ce n’est ni une feuille de temps, ni une mesure de productivité, ni une preuve de valeur produite. Pour qu’un journal d’activité devienne utile, il faut construire une chaîne d’interprétation explicite entre le signal technique et la réalité du travail.

## Le mauvais réflexe : additionner tout ce qui est horodaté

La plupart des erreurs commencent par une opération qui paraît raisonnable : regrouper les événements consécutifs, calculer leur durée, puis additionner. Le résultat est précis à la seconde près — et souvent faux dans son sens.

Plusieurs phénomènes gonflent mécaniquement cette durée :

- les tâches système, mises à jour et synchronisations automatiques ;
- les écrans verrouillés ou les sessions de connexion laissées ouvertes ;
- les applications visibles mais non utilisées ;
- les onglets ou terminaux qui continuent une opération en arrière-plan ;
- les événements très courts générés par des outils différents pour une même action ;
- les périodes de lecture, de réunion ou de réflexion que le poste détecte mal.

Le problème n’est pas seulement la présence de « bruit ». Certains signaux sont de faux positifs : la machine paraît active alors que la personne ne l’est pas. D’autres sont de faux négatifs : une conversation décisive, un schéma sur papier ou une réflexion sans interaction clavier peuvent être du travail réel sans laisser beaucoup de traces.

Additionner les événements revient à mesurer la disponibilité du capteur, pas l’activité humaine. Et multiplier les capteurs ne résout pas automatiquement le problème : on obtient souvent davantage de précision technique, mais aussi davantage de doublons et d’ambiguïtés.

## Un modèle mental en quatre couches

Pour raisonner correctement, je distingue quatre couches. Chacune répond à une question différente.

### 1. La télémétrie : que s’est-il passé sur la machine ?

C’est la couche factuelle : une application était au premier plan, un commit a été créé, un ticket a changé d’état, une réunion figurait au calendrier. Ces éléments doivent rester disponibles comme preuves brutes. Il ne faut pas les réécrire pour les faire correspondre à une narration plus confortable.

Mais une preuve brute n’est pas encore une conclusion. « Une fenêtre était ouverte pendant quatre heures » ne signifie pas « quatre heures ont été travaillées ».

### 2. La présence : une personne pouvait-elle réellement interagir ?

Cette couche élimine les états manifestement non humains : veille, verrouillage, écran de connexion, maintenance automatique, activité nocturne d’un processus. Elle permet de calculer une durée de présence plausible.

C’est un premier filtre indispensable, mais insuffisant. Être présent devant une machine ne signifie pas consacrer toute son attention à une tâche, encore moins produire une valeur mesurable.

### 3. L’engagement : à quelle activité l’attention était-elle probablement consacrée ?

Ici, on regroupe les traces en séquences cohérentes : développement, revue, rédaction, support, recherche, réunion. Les micro-événements issus de plusieurs outils peuvent appartenir au même épisode de travail. À l’inverse, deux fenêtres successives ne relèvent pas forcément de la même intention.

Cette couche repose sur des hypothèses. Elles doivent être visibles, révisables et accompagnées d’un niveau de confiance. Un système sérieux sait dire « probable » ou « ambigu » au lieu de transformer chaque trace en certitude.

### 4. La contribution : qu’est-ce qui a avancé ?

C’est la couche que les organisations cherchent généralement à comprendre : une décision prise, un incident résolu, une version validée, un document clarifié, un risque réduit. Elle ne se déduit jamais parfaitement du temps d’écran.

Une contribution peut nécessiter trois heures d’exploration sans livrable apparent. Une autre peut être débloquée en dix minutes grâce à une connaissance acquise pendant des années. Le temps reste utile pour planifier, facturer ou détecter une surcharge, mais il ne suffit pas à qualifier la valeur.

## Trois horloges, trois usages

Une autre façon de résumer le modèle consiste à séparer trois horloges :

- **l’horloge de la machine**, qui mesure la continuité des signaux ;
- **l’horloge de l’attention**, qui estime les séquences de travail humain ;
- **l’horloge du résultat**, qui relie ces séquences à des avancées observables.

Aucune ne remplace les autres. L’horloge machine est utile pour diagnostiquer la collecte. L’horloge de l’attention aide à reconstituer une journée ou à préparer une feuille de temps. L’horloge du résultat sert au pilotage et à l’apprentissage collectif.

Les dérives apparaissent quand on utilise une horloge pour répondre à la question d’une autre. Une entreprise qui transforme le temps machine en indicateur de performance ne mesure pas mieux le travail : elle récompense surtout les comportements qui rendent la machine plus observable.

## Les critères d’un journal d’activité crédible

Un bon système de reconstitution du travail ne cherche pas à tout automatiser. Il organise la frontière entre calcul déterministe et jugement humain.

Il devrait au minimum respecter six principes :

1. **Conserver les traces originales.** Toute synthèse doit pouvoir être reliée à ses sources sans modifier l’historique brut.
2. **Exclure explicitement l’activité non humaine.** Les catégories système, veille et verrouillage doivent être configurables et auditables.
3. **Dédupliquer avant d’additionner.** Un changement peut apparaître simultanément dans l’éditeur, le gestionnaire de tickets et l’historique de version.
4. **Regrouper par intention, pas seulement par proximité temporelle.** Une séquence de travail est une hypothèse métier, pas un simple intervalle entre deux clics.
5. **Afficher l’incertitude.** Les périodes ambiguës doivent être soumises à validation plutôt que classées arbitrairement.
6. **Séparer durée, facturation et valeur.** Une activité réelle peut être interne, non facturable ou sans résultat immédiat ; ces dimensions ne doivent pas être fusionnées.

Cette architecture produit parfois un chiffre moins spectaculaire, mais beaucoup plus défendable. Une durée corrigée, assortie de preuves et d’incertitudes, vaut mieux qu’un total exhaustif en apparence.

## La mesure modifie le travail

Il existe enfin un enjeu humain. Lorsqu’un dispositif est présenté comme une mesure individuelle de productivité, les personnes apprennent à optimiser le signal : garder des applications ouvertes, fragmenter les actions, privilégier les tâches visibles et éviter les périodes de réflexion qui paraissent « inactives ».

On obtient alors une organisation très occupée et mal informée.

À l’inverse, un journal d’activité peut être précieux s’il sert de mémoire assistée : retrouver le contexte d’une journée, réduire l’oubli lors de la saisie des temps, identifier les interruptions, documenter une intervention ou détecter une charge anormale. La différence ne tient pas seulement à l’algorithme. Elle tient à la finalité déclarée, à la transparence des règles et au droit de correction.

La bonne question n’est donc pas : « Combien de temps l’écran a-t-il été actif ? » Elle est : « Quelles traces permettent de reconstituer honnêtement le travail, avec quelles exclusions et quel niveau de confiance ? »

Le temps d’écran devient utile lorsqu’il cesse d’être traité comme une réponse. C’est un signal parmi d’autres, au début d’un raisonnement — jamais la mesure finale du travail.
