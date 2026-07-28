---
title: "Avant Temporal, dessinez la frontière d’idempotence"
description: "Temporal résout un problème difficile : exécuter des processus longs malgré les pannes, les redémarrages et les délais. Mais il ne peut pas décider à la place du métier si une…"
pubDate: 2026-09-22T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
  - Kafka
  - Temporal
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Temporal résout un problème difficile : exécuter des processus longs malgré les pannes, les redémarrages et les délais. Mais il ne peut pas décider à la place du métier si une facture doit être émise deux fois, si un paiement a déjà été comptabilisé ou si une relance client peut être rejouée sans conséquence.

C’est là que commencent beaucoup de mauvaises architectures d’orchestration. On introduit un moteur de workflow en espérant qu’il absorbera l’ambiguïté du système existant. Il rend effectivement l’exécution plus robuste — mais il rend aussi les incohérences plus persistantes, plus rapides et plus difficiles à attribuer.

Avant de choisir les workflows, les files ou les politiques de reprise, il faut donc dessiner une frontière plus fondamentale : **la frontière d’idempotence**.

Cette frontière répond à une question simple : *qu’est-ce qui permet au système de reconnaître qu’une intention métier a déjà été prise en compte ?*

## Le mauvais réflexe : commencer par le diagramme du workflow

Lorsqu’un processus traverse plusieurs domaines — commande, stock, facturation, comptabilité, notification — le premier réflexe consiste souvent à dessiner une suite d’étapes : réserver, expédier, facturer, comptabiliser, notifier.

Le diagramme paraît clair. Pourtant, il ne dit rien sur les cas qui coûtent réellement cher :

- une étape réussit mais sa confirmation se perd ;
- un producteur publie deux fois le même événement ;
- un worker redémarre après avoir appelé un service externe ;
- deux requêtes concurrentes déclenchent la même intention métier ;
- un opérateur relance manuellement un traitement déjà terminé ;
- le nom technique d’un workflow change alors que l’opération métier reste la même.

Dans un système distribué, la répétition n’est pas une anomalie exceptionnelle. C’est un mode normal de récupération. Les messages sont renvoyés, les activités sont rejouées, les timeouts créent de l’incertitude. Chercher un « exactement une fois » global revient généralement à déplacer le problème plutôt qu’à le résoudre.

La bonne question n’est donc pas : « Comment empêcher toute répétition ? » Elle est : **« À quel endroit une répétition cesse-t-elle de produire un nouvel effet métier ? »**

## Le modèle mental : intention, effet, preuve

Une architecture durable sépare trois choses que l’on mélange trop souvent.

### 1. L’intention métier

L’intention exprime ce que l’organisation veut accomplir : émettre la facture d’une commande, enregistrer un paiement, réserver un stock ou envoyer une relance donnée.

Elle doit posséder une identité stable, dérivée du métier et non d’un détail d’exécution. Par exemple, l’émission initiale d’une facture pour une commande donnée n’est pas « le job lancé mardi à 14 h 03 ». C’est une opération identifiable indépendamment du nombre de tentatives, du worker qui la traite ou de la version du workflow.

Cette identité est le premier élément de la frontière d’idempotence. Si deux appels représentent la même intention, ils doivent converger vers la même clé.

### 2. L’effet durable

L’effet est le changement observable : une ligne de grand livre, une réservation, un document émis, un ordre envoyé à un prestataire.

Chaque composant qui possède un effet doit aussi posséder la règle qui empêche sa duplication. Une contrainte d’unicité, une clé idempotente chez un fournisseur ou une table de déduplication valent mieux qu’un drapeau en mémoire. L’idempotence doit vivre au plus près de l’autorité qui accepte l’effet.

Un orchestrateur peut décider de réessayer. Il ne peut pas garantir à lui seul qu’un système distant interprétera le second appel comme la continuation du premier.

### 3. La preuve

La preuve permet d’expliquer ce qui s’est passé : quelle intention a été acceptée, quel événement l’a portée, quel workflow l’a traitée, quel effet a été produit et pourquoi une répétition a été ignorée.

L’historique technique d’un moteur de workflow est précieux, mais il ne remplace pas forcément un audit métier. Sa rétention, son vocabulaire et ses règles d’accès répondent à des besoins opérationnels. Un audit métier doit survivre aux renommages techniques et rester compréhensible par les fonctions qui portent la responsabilité de l’opération.

Ces trois niveaux donnent une lecture simple : **l’intention reçoit une identité, l’effet applique une règle d’unicité, la preuve relie les deux**.

## L’outbox fixe la première couture

Le premier trou classique se situe entre la base transactionnelle et le bus d’événements. Une commande peut être validée en base, puis ne jamais être publiée si le processus tombe au mauvais moment. À l’inverse, publier d’abord puis écrire ensuite peut annoncer un état qui n’existe pas.

Le pattern outbox réduit cette ambiguïté : le changement métier et l’enregistrement de l’événement à publier sont écrits dans la même transaction locale. Un poller peut ensuite publier l’événement autant de fois que nécessaire. La publication devient « au moins une fois », mais la perte silencieuse entre l’état et l’événement disparaît.

Le mot important est **canonique**. Si chaque module invente son format, sa clé et son propre mécanisme de publication, l’organisation ne possède pas une outbox : elle possède une collection de coutures incompatibles.

Un contrat d’outbox utile précise au minimum :

- l’identité stable de l’événement et de l’agrégat concerné ;
- le type d’intention et sa version de schéma ;
- la date métier et la date technique ;
- les informations de corrélation et de causalité ;
- l’acteur ou le contexte à conserver pour l’audit ;
- les règles de publication, de rétention et de reprise.

L’outbox ne supprime pas les doublons. Elle rend leur traitement explicite et observable. C’est exactement ce que l’on attend d’une bonne frontière.

## L’identité du workflow est une décision métier

Une fois l’événement publié, le moteur d’orchestration doit savoir si une nouvelle exécution représente une nouvelle affaire ou une tentative supplémentaire de la même affaire.

L’identifiant du workflow ne devrait donc pas être un UUID généré à chaque réception. Il devrait encoder — directement ou par une clé stable — l’invariant métier que l’on protège. Une opération comme « cycle de traitement de la commande X » ou « campagne de relance Y pour l’échéance Z » doit conserver son identité à travers les retries et les redémarrages.

Il faut également définir la politique de réutilisation : dans quelles conditions une opération terminée peut-elle recommencer ? Une correction est-elle une nouvelle intention ou une nouvelle version de la précédente ? Une annulation compense-t-elle un effet ou efface-t-elle son histoire ?

Ces questions ne sont pas des réglages Temporal. Ce sont des décisions de domaine que Temporal peut ensuite appliquer avec rigueur.

## Une checklist avant d’orchestrer

Avant de construire le premier workflow, je cherche des réponses concrètes à ces questions :

1. **Quelle est l’intention métier et quelle clé la rend unique ?**
2. **Où cette clé est-elle imposée durablement ?**
3. **Quel composant est l’autorité de chaque effet irréversible ?**
4. **Comment l’état et l’événement sortant restent-ils cohérents ?**
5. **Que se passe-t-il si chaque message ou activité est exécuté deux fois ?**
6. **Les appels externes acceptent-ils une clé idempotente ? Sinon, comment réduit-on l’incertitude ?**
7. **Comment distingue-t-on retry, correction, compensation et nouvelle opération ?**
8. **Quelle trace permet d’expliquer la chaîne intention → événement → workflow → effet ?**
9. **Les identités survivent-elles aux changements de noms, de versions et d’infrastructure ?**
10. **Peut-on rejouer sans réémettre les effets déjà acquis ?**

Si les réponses sont floues, ajouter un orchestrateur augmente la sophistication sans réduire le risque métier.

## Temporal vient après la frontière, pas à sa place

Une fois cette frontière dessinée, Temporal devient extrêmement utile. Il apporte la reprise durable, les timers, les signaux, les retries contrôlés et une visibilité cohérente sur les processus longs. Mais il opère alors sur un terrain préparé : les intentions ont une identité, les effets savent refuser les doublons, les événements sont reliés à l’état transactionnel et l’audit possède son propre contrat.

Ce raisonnement dépasse Temporal. Il s’applique aux consommateurs Kafka, aux tâches asynchrones, aux webhooks, aux paiements, aux imports comptables et aux agents logiciels. Partout où un système peut recevoir deux fois la même demande, la frontière d’idempotence détermine si la répétition devient une simple tentative ou un second acte métier.

La robustesse d’une orchestration ne se mesure pas à la beauté de son diagramme nominal. Elle se mesure à sa capacité à répéter l’exécution sans répéter l’intention. **Dessinez d’abord cette frontière ; le choix du moteur et la forme des workflows deviendront ensuite beaucoup plus simples.**
