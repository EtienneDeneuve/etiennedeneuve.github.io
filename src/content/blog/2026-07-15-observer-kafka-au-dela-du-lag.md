---
title: "Observer Kafka au-delà du lag consommateur"
description: "Le lag consommateur est probablement la métrique Kafka la plus connue. Elle est simple à afficher, facile à comparer et suffisamment intuitive pour déclencher une inquiétude :…"
pubDate: 2026-11-17T09:00:00.000Z
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
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Le lag consommateur est probablement la métrique Kafka la plus connue. Elle est simple à afficher, facile à comparer et suffisamment intuitive pour déclencher une inquiétude : si le nombre de messages en attente augmente, quelque chose va mal.

Cette intuition est utile, mais incomplète. Un lag élevé peut être normal pendant un rattrapage planifié. Un lag faible peut masquer un producteur qui n’émet plus rien, des messages rejetés avant publication ou un traitement qui répond vite en dégradant silencieusement les données. Pris seul, le lag décrit une distance entre deux offsets ; il ne décrit ni la santé du service rendu, ni la cause d’une dégradation.

Le bon modèle mental consiste donc à ne plus observer « Kafka » comme un composant isolé, mais comme une chaîne de traitement événementielle. Les méthodes RED et USE permettent de lire cette chaîne sous deux angles complémentaires : le comportement du flux et la capacité de l’infrastructure à le soutenir.

## Le mauvais réflexe : faire du lag un verdict

Le lag d’un groupe de consommateurs mesure, pour chaque partition, l’écart entre l’offset disponible côté broker et l’offset validé par le groupe. C’est un indicateur de stock, pas un diagnostic.

Deux limites en découlent.

D’abord, une valeur absolue n’a pas de sens sans le rythme du système. Dix mille messages représentent quelques secondes pour un flux traité à très haut débit, mais plusieurs heures pour un traitement lent. Ce qui compte n’est pas seulement la profondeur du retard : c’est sa dynamique. Le lag augmente-t-il ? À quelle vitesse ? Le consommateur traite-t-il plus vite que les nouveaux messages n’arrivent ? Combien de temps faudrait-il pour revenir à l’équilibre ?

Ensuite, le lag ne voit que ce qui a atteint Kafka et ce qui est suivi par les offsets. Il ne dit rien d’un producteur bloqué en amont, d’erreurs de sérialisation, d’un taux anormal de retries, d’une dead-letter queue qui se remplit ou d’une dépendance aval devenue lente. Un tableau de bord centré sur le lag peut donc être parfaitement vert pendant que le service métier est à l’arrêt.

Le lag reste indispensable. Il faut simplement le replacer dans un ensemble de signaux qui répondent à trois questions distinctes : le flux avance-t-il, le traitement reste-t-il correct, et la plateforme dispose-t-elle encore de marge ?

## RED : observer le service rendu par le flux

RED signifie **Rate, Errors, Duration**. La méthode est souvent appliquée aux API HTTP, mais elle fonctionne très bien sur une chaîne événementielle dès lors que l’on définit clairement l’opération observée.

Pour un producteur, RED peut se lire ainsi :

- **Rate** : nombre d’événements produits par unité de temps ;
- **Errors** : publications échouées, abandonnées ou rejetées ;
- **Duration** : latence de publication et d’acquittement.

Pour un consommateur :

- **Rate** : événements lus, traités et validés ;
- **Errors** : échecs de traitement, retries, messages envoyés en quarantaine ou ignorés ;
- **Duration** : temps de traitement d’un événement ou d’un lot.

Cette lecture révèle immédiatement des situations que le lag seul ne distingue pas. Si le débit produit tombe à zéro, un lag nul n’est pas rassurant. Si le débit consommé reste stable mais que les erreurs augmentent, la file se vide peut-être au prix d’une perte fonctionnelle. Si la durée de traitement dérive, le lag n’est que la conséquence tardive d’une capacité qui se dégrade déjà.

Il faut également mesurer la chaîne de bout en bout lorsque le contexte le permet : temps entre la création d’un événement et l’achèvement de son traitement, âge des événements les plus anciens encore en attente, proportion traitée dans l’objectif de délai. Ces mesures parlent davantage du service rendu que le simple écart d’offsets.

RED remet ainsi l’observabilité du côté de l’expérience attendue : un événement doit être accepté, transporté et traité correctement dans un délai donné.

## USE : comprendre pourquoi la capacité se dégrade

USE signifie **Utilization, Saturation, Errors**. Là où RED observe le comportement du service, USE aide à examiner les ressources qui le rendent possible.

Sur les brokers Kafka, cela conduit à regarder notamment l’utilisation du CPU, du disque, du réseau et des threads de traitement ; la saturation des files internes, des requêtes ou des opérations disque ; puis les erreurs de réplication, d’élection, d’écriture ou de lecture. L’objectif n’est pas d’empiler toutes les métriques disponibles, mais d’identifier les ressources dont l’épuisement explique une dégradation visible dans RED.

La même logique s’applique aux consommateurs. Combien d’instances sont actives par rapport au nombre de partitions ? Certaines partitions concentrent-elles l’essentiel du trafic ? Les workers sont-ils occupés en permanence ? Le pool de connexions vers la base aval est-il saturé ? La mémoire, le garbage collector ou le stockage local imposent-ils des pauses ?

Cette distinction est essentielle : augmenter le nombre de consommateurs ne résout pas nécessairement un retard. Si le groupe compte déjà autant de consommateurs actifs que de partitions, les instances supplémentaires resteront inactives. Si la dépendance aval est saturée, accélérer Kafka ne fera que déplacer la pression. Si une seule partition reçoit la majorité des événements, le problème relève peut-être du partitionnement plutôt que du dimensionnement global.

USE transforme donc une alerte « lag élevé » en hypothèses vérifiables sur la capacité, la contention et les erreurs d’infrastructure.

## Un cockpit en quatre plans

Une vue d’exploitation utile peut être organisée en quatre plans, du service rendu vers ses causes probables.

### 1. La demande

Observer le débit entrant, sa saisonnalité et sa répartition par topic et partition. Une hausse du lag n’a pas la même signification après un pic attendu que pendant une charge stable. La distribution compte autant que le total : un déséquilibre de clés peut créer un point chaud invisible dans les moyennes.

### 2. Le traitement

Comparer le débit entrant au débit effectivement traité, suivre la latence de traitement, les erreurs, les retries et les abandons. C’est ici que RED donne le signal le plus directement actionnable. Le taux de succès doit porter sur le résultat du traitement, pas seulement sur la lecture du message.

### 3. Le stock

Afficher le lag, mais aussi sa pente et, si possible, son équivalent temporel. Une estimation simple du temps de résorption — backlog divisé par la capacité nette de rattrapage — est souvent plus parlante qu’un nombre brut. Lorsque la capacité de consommation n’excède plus le débit entrant, ce temps devient théoriquement infini : c’est un signal beaucoup plus fort qu’un seuil arbitraire.

### 4. La capacité et les dépendances

Relier les signaux USE des brokers, des consommateurs et des systèmes aval pour passer du symptôme à la contrainte : partition chaude, disque saturé, workers au plafond ou dépendance lente.

Ce cockpit n’a pas besoin d’être exhaustif. Il doit rendre visible la causalité probable et permettre à l’opérateur de décider : attendre un rattrapage normal, corriger une erreur applicative, redistribuer la charge ou augmenter une capacité réellement limitante.

## Des alertes fondées sur un risque, pas sur un chiffre universel

Un seuil fixe de lag est rarement portable d’un flux à l’autre. Les volumes, les délais acceptables et les conséquences métier diffèrent. Il est plus robuste d’alerter sur une combinaison de conditions : retard qui augmente durablement, âge du plus ancien événement au-delà d’un objectif, capacité de rattrapage insuffisante, taux d’erreur anormal ou saturation confirmée.

Une bonne politique d’alerte distingue aussi les symptômes des causes. L’alerte principale exprime l’impact : « le traitement ne respecte plus son objectif de fraîcheur ». Les signaux techniques enrichissent le diagnostic : « la durée de traitement augmente tandis que la dépendance aval est saturée ». Cette hiérarchie évite de réveiller une équipe pour chaque oscillation d’offset tout en conservant les éléments nécessaires à l’investigation.

Enfin, chaque alerte devrait avoir un propriétaire, un objectif explicite et une procédure de diagnostic. Sans cela, même le meilleur ensemble de métriques produit surtout du bruit.

## Au-delà de Kafka : observer une promesse de traitement

Ce modèle dépasse Kafka. Il s’applique aux files managées, aux bus d’événements, aux pipelines de données et aux systèmes asynchrones en général. Partout, la même erreur consiste à confondre la profondeur d’une file avec la santé du service.

L’observabilité devient réellement utile lorsqu’elle relie quatre dimensions : la demande reçue, le traitement réussi, le retard accumulé et la capacité disponible. RED décrit ce que vit le flux. USE explique ce que subissent les ressources. Le lag fait le pont entre les deux, mais il n’est ni le point de départ unique ni le verdict final.

Observer Kafka au-delà du lag, c’est finalement changer de question. Au lieu de demander « combien de messages attendent ? », on demande : **sommes-nous encore capables de tenir la promesse de traitement, et savons-nous où agir si ce n’est plus le cas ?**
