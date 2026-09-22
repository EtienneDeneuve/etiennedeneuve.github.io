---
title: "OpenTelemetry sur 200 services : couvrir vite sans refaire quinze ans de code"
description: "Sur une application brownfield, l’enjeu n’était pas de refaire l’instrumentation parfaite service par service, mais de donner aux équipes un cadre commun qu’elles pouvaient appliquer vite."
pubDate: 2026-09-22T21:30:00.000Z
language: fr
contentType: field-note
pillar: observability
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - OpenTelemetry
  - Observability
  - Brownfield
  - Developer Experience
  - Platform Engineering
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-09-22-opentelemetry-pourquoi-je-lai-propose
  - 2026-09-22-opentelemetry-cardinalite-pii-sampling
  - 2026-09-22-opentelemetry-exploiter-la-plateforme
---

> Série **OpenTelemetry en production**, 2/4. Le début : [pourquoi j’ai proposé OpenTelemetry](/2026-09-22-opentelemetry-pourquoi-je-lai-propose). La suite : [cardinalité, PII et sampling](/2026-09-22-opentelemetry-cardinalite-pii-sampling).

Une architecture propre sur un slide, c’est facile. La faire rentrer dans environ 200 services dont certains ont quinze ans, c’est autre chose.

Il y avait plusieurs langages, des bibliothèques communes historiques et une couverture de tests correcte par endroits, moins rassurante ailleurs. Rien d’exceptionnel pour une application qui a beaucoup vécu.

L’erreur aurait été de transformer la migration OpenTelemetry en refonte générale. On aurait gagné un beau programme de trois ans et probablement perdu l’objectif initial.

J’ai donc proposé de faire l’inverse : définir un socle suffisamment propre, aider les équipes à l’appliquer partout, puis enrichir les traces là où ça apporte vraiment quelque chose.

## Couverture d’abord

Au premier passage, je voulais surtout vérifier quelques invariants :

- le service émet bien ses traces ;
- le contexte se propage ;
- les erreurs remontent ;
- les appels HTTP et SQL sont visibles ;
- les logs peuvent être corrélés avec la trace ;
- l’instrumentation ne change pas le comportement du service.

Ce n’est pas très glamour, mais avec 200 services, ça donne déjà énormément de valeur.

On peut toujours passer trois semaines à dessiner la taxonomie parfaite des spans d’un domaine métier. Pendant ce temps-là, le reste de l’application reste aveugle.

Sur du brownfield, je préfère une couverture correcte et homogène, puis améliorer les endroits où les équipes ont réellement besoin de plus de contexte.

## Une task force avec la R&D

On a monté une petite task force pour aider les équipes à avancer vite sans centraliser tout le travail chez quelques personnes.

Concrètement : ateliers, exemples dans les différents langages, accompagnement sur les premières PR, déploiement en dev, vérification des signaux, puis corrections avec l’équipe concernée.

Le changement restait le plus petit possible. Si on pouvait ajouter l’instrumentation sans réorganiser le service, on ne réorganisait pas le service.

Sur une application ancienne, c’est un principe qui évite beaucoup de dérives : une migration d’observabilité n’est pas une excuse pour corriger en même temps tout ce qu’on n’aime pas dans le code.

## Cursor et Claude ont vraiment aidé

On a aussi préparé un skill et des instructions pour les assistants de code utilisés par les équipes.

Le but n’était pas de demander à Cursor ou Claude "mets OpenTelemetry là-dedans" et de prendre la réponse telle quelle. Ça aurait surtout donné 200 variantes.

On leur donnait la manière dont **nous** voulions intégrer le SDK, les patterns à conserver et le type de changement acceptable.

Ensuite, l’outil faisait très bien la partie répétitive : trouver le point d’initialisation, ajouter le SDK, propager le contexte, reprendre un pattern déjà validé.

La PR restait relue normalement, puis déployée en dev.

L’IA a accéléré l’exécution. Elle n’a pas remplacé la convention ni la validation.

## Les traces ont trouvé des problèmes très concrets

La partie C++ est probablement le meilleur exemple.

Une fois les traces en place, on a retrouvé des requêtes SQL mal gérées qui contribuaient à faire monter la RAM et le CPU. On a aussi vu des appels répétés qui auraient dû être cachés.

Rien de très exotique. Justement.

Une métrique montre facilement qu’un service consomme trop. La trace donne le chemin qui explique pourquoi.

C’est aussi ce qui a fait que la R&D a assez vite accroché au sujet. On ne leur demandait plus d’instrumenter "pour l’observabilité". Ils pouvaient utiliser les traces pour comprendre des comportements qu’ils cherchaient déjà à expliquer.

## Les spans métier viennent après

L’auto-instrumentation donne surtout une vision technique : HTTP, SQL, appels externes, erreurs.

On a commencé à ajouter quelques spans métier avec les équipes lorsque ça apportait du sens, mais sans chercher à tout modéliser dès le départ.

Je préfère ce rythme-là.

Quand les développeurs commencent à utiliser les traces, ils voient vite ce qui manque. C’est à ce moment qu’un span supplémentaire devient utile, parce qu’il répond à une vraie question.

Ajouter des dizaines de spans "au cas où" avant même d’avoir un usage produit surtout du volume et des conventions que personne ne suit longtemps.

## Corréler les logs sans tout réécrire

Pour les logs, on a patché une bibliothèque commune afin d’ajouter les éléments nécessaires à la corrélation avec les traces.

Ça évite de modifier chaque application à la main et surtout de laisser chaque équipe choisir son format.

Le gain pendant un debug est assez immédiat : on part d’une trace et on retrouve les logs du même traitement sans reconstruire le contexte à partir des timestamps, du pod ou d’un identifiant métier.

Cette normalisation a aussi fait ressortir un sujet moins sympa : plus on enrichit les signaux, plus on risque d’y mettre des données qui n’ont rien à faire dans un backend d’observabilité.

PII, RIB, identifiants trop dynamiques, noms de bases... c’est précisément là que la partie suivante devient intéressante.

## Ce que je retiens de cette phase

Pour une migration brownfield, je garderais la même méthode :

- décider les conventions une fois ;
- rendre leur application simple ;
- automatiser ce qui est répétitif ;
- valider service par service ;
- privilégier la couverture avant la finesse ;
- ajouter du contexte métier quand un usage le justifie.

Le résultat n’est pas "200 services parfaitement instrumentés". Ce serait une formulation trop belle pour être vraie.

Le résultat utile, c’est un parc qui parle à peu près le même langage et des équipes capables d’améliorer l’instrumentation sans repartir de zéro à chaque fois.

La difficulté suivante arrive rapidement : quand on collecte mieux, on peut aussi collecter beaucoup trop.

## Suite

[3/4 : OpenTelemetry, cardinalité, PII et sampling : les pièges qui arrivent après](/2026-09-22-opentelemetry-cardinalite-pii-sampling)

## Sources officielles

- [OpenTelemetry : instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/)
- [OpenTelemetry Operator : auto-instrumentation](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/)
- [OpenTelemetry : contexte et propagation](https://opentelemetry.io/docs/concepts/context-propagation/)
- [OpenTelemetry : traces](https://opentelemetry.io/docs/concepts/signals/traces/)
