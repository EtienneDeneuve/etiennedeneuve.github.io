---
title: "Observer une dépendance, pas seulement un service"
description: "Une alerte indique que la latence d’une API vient de dépasser son seuil. Le tableau de bord confirme le symptôme : les requêtes ralentissent, puis quelques erreurs…"
pubDate: 2026-10-27T09:00:00.000Z
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


Une alerte indique que la latence d’une API vient de dépasser son seuil. Le tableau de bord confirme le symptôme : les requêtes ralentissent, puis quelques erreurs apparaissent. Pourtant, le service lui-même ne semble ni saturé ni instable. Commence alors une enquête familière : ouvrir d’autres tableaux et reconstruire sous pression le chemin réel d’une requête.

Ce scénario révèle une limite fréquente de l’observabilité. Nous instrumentons les services comme des objets isolés, alors que leur fiabilité dépend d’un graphe : bases de données, files de messages, fournisseurs d’identité, API tierces, DNS, stockage, réseau ou services internes. L’utilisateur ne consomme pas une collection de composants. Il expérimente une chaîne de dépendances.

Le bon objet d’observation n’est donc pas toujours le service. C’est souvent la relation entre ce service et ce dont il dépend.

## Le mauvais réflexe : ajouter toujours plus de métriques au service

Lorsqu’un diagnostic prend trop de temps, le premier réflexe consiste souvent à enrichir le tableau de bord du service affecté. On ajoute des métriques de processus, de runtime, de conteneur ou de machine. Cette information peut être utile, mais elle répond principalement à une question : « Mon service manque-t-il de ressources ou fonctionne-t-il mal ? »

Elle répond beaucoup moins bien à une autre question, pourtant décisive : « Mon service attend-il quelque chose qui se dégrade ailleurs ? »

Un service peut disposer de CPU, de mémoire et de connexions disponibles tout en ralentissant fortement. Il suffit qu’une dépendance réponde plus lentement, refuse une partie du trafic ou impose davantage de tentatives. Dans ce cas, le service appelant absorbe le problème : ses files d’attente s’allongent, ses délais expirent, ses pools se remplissent et ses propres erreurs finissent par augmenter. Les symptômes locaux sont réels, mais leur origine ne l’est pas.

Empiler les métriques sans représenter cette causalité produit des cockpits très riches et des diagnostics toujours pauvres. Le problème n’est pas l’absence de données. C’est l’absence de modèle.

## Changer d’unité d’analyse : du nœud vers l’arête

On peut représenter un système distribué comme un graphe. Les services et les infrastructures sont les nœuds ; leurs interactions sont les arêtes. L’observabilité traditionnelle décrit surtout l’état des nœuds. L’observabilité des dépendances décrit aussi la qualité des arêtes.

Cette distinction change la façon de construire un tableau de bord. Pour chaque dépendance importante, il faut rapprocher trois perspectives complémentaires :

1. **L’expérience du service appelant.** Que voit-il lorsqu’il sollicite la dépendance ? Taux de requêtes, erreurs, durée, délais expirés, nouvelles tentatives ou ruptures de circuit décrivent cette relation depuis le côté consommateur.
2. **L’état du service appelé.** Reçoit-il effectivement le trafic ? Répond-il lentement ou avec des erreurs ? Ses Golden Signals — latence, trafic, erreurs et saturation — permettent de vérifier si le symptôme est partagé ou seulement perçu par un appelant.
3. **La pression sur les ressources qui soutiennent l’appel.** Utilisation, saturation et erreurs, selon le modèle USE, indiquent si une capacité physique ou logique approche de sa limite : pool de connexions, workers, partitions, stockage, quota ou autre ressource bornée.

Les approches RED et USE ne sont donc pas concurrentes. RED — Rate, Errors, Duration — décrit bien le comportement d’un service ou d’un appel. USE — Utilization, Saturation, Errors — décrit la pression exercée sur une ressource. Les Golden Signals fournissent une lecture orientée fiabilité. Ensemble, ces modèles relient l’expérience utilisateur, le comportement de la dépendance et ses contraintes de capacité.

Le point essentiel n’est pas d’afficher ces acronymes dans trois rangées distinctes. Il est de les aligner sur la même fenêtre temporelle et sur le même chemin critique.

## Lire un incident comme une divergence de perspectives

Ce modèle rend les divergences particulièrement utiles.

Si la durée augmente côté appelant et côté dépendance, l’origine se situe probablement dans la dépendance ou dans l’une de ses propres dépendances. Si l’appelant observe des délais expirés mais que le service appelé ne voit pas le trafic correspondant, il faut examiner le chemin entre les deux : résolution de nom, connexion, équilibrage, chiffrement, proxy ou autre intermédiaire. Si la latence augmente sans saturation visible, la capacité brute n’est peut-être pas la bonne piste ; une contention logique, une dépendance en aval ou un changement dans la distribution des requêtes peut être en cause.

À l’inverse, une saturation n’est pas automatiquement une explication. Une ressource peut être très utilisée tout en respectant son objectif de service. Ce qui compte est la corrélation temporelle et causale entre pression, dégradation de l’appel et impact utilisateur.

Le tableau de bord devient alors un outil de raisonnement. Il ne dit pas seulement « quelque chose va mal ». Il aide à tester rapidement des hypothèses :

- le problème est-il visible depuis tous les consommateurs ou depuis un seul ?
- la dépendance reçoit-elle le trafic attendu ?
- les erreurs sont-elles produites, transportées ou synthétisées par un délai expiré ?
- la durée augmente-t-elle avant la saturation, ou l’inverse ?
- les nouvelles tentatives masquent-elles les erreurs tout en amplifiant la charge ?

Cette dernière question est importante. Les mécanismes de résilience modifient les signaux. Un retry peut améliorer temporairement le taux de succès tout en augmentant le trafic vers une dépendance déjà fragile. Un cache peut préserver l’expérience utilisateur tout en dissimulant une panne partielle. Un circuit breaker peut réduire la pression mais faire apparaître des erreurs locales. Observer une dépendance suppose donc d’observer aussi les mécanismes qui transforment son comportement.

## Les critères d’un cockpit de dépendances utile

Un bon cockpit n’est pas un inventaire exhaustif. Il organise les informations nécessaires à une décision rapide. Quelques critères permettent d’en évaluer la qualité.

**Il part d’un parcours ou d’un service rendu.** Les dépendances sont priorisées selon leur contribution à un chemin critique, pas selon la facilité à collecter leurs métriques.

**Il nomme les relations.** « API vers identité » ou « worker vers file » est plus utile qu’une liste de composants sans contexte. Une même dépendance peut se comporter différemment selon l’appelant, la méthode ou la classe de trafic.

**Il aligne les dimensions.** Environnement, région, version, opération et classe d’erreur doivent permettre une comparaison cohérente sans créer une cardinalité incontrôlée.

**Il distingue symptôme, cause probable et impact.** Une hausse de durée est un symptôme ; la saturation d’un pool peut constituer une cause probable ; la violation d’un objectif de niveau de service représente l’impact. Les confondre conduit à des alertes bruyantes et à des conclusions prématurées.

**Il conserve une vue orientée utilisateur.** Même lorsqu’une dépendance se dégrade, la question finale reste : le service rendu est-il affecté ? Cette vue évite de traiter toute anomalie interne comme un incident majeur.

**Il permet de naviguer vers le détail.** Le cockpit doit accélérer la localisation, pas remplacer les traces, les journaux ou les profils. Une fois la zone fautive identifiée, ces outils servent à expliquer le mécanisme précis.

## Observer aussi le contrat opérationnel

Une dépendance n’est pas seulement un endpoint. C’est un contrat opérationnel, explicite ou implicite : niveau de disponibilité attendu, budget de latence, limites de débit, comportement en cas de surcharge, politique de retry, durée des timeouts et mode de dégradation acceptable.

Sans ce contrat, un graphique reste difficile à interpréter. Une latence de 300 millisecondes est-elle normale, tolérable ou catastrophique ? Un taux d’erreur de 1 % est-il absorbé par une nouvelle tentative ou visible par l’utilisateur ? La capacité annoncée tient-elle compte des pics et des reprises après incident ?

L’observabilité devient plus puissante lorsqu’elle rend ce contrat visible. Elle permet alors de détecter non seulement une panne, mais aussi l’érosion progressive d’une marge : latence qui se rapproche du budget, pool qui reste saturé plus longtemps, retry qui augmente semaine après semaine, ou dépendance dont le comportement varie selon les consommateurs.

Cette lecture dépasse largement un outil de visualisation. Elle influence la conception des SLO, les tests de charge, les stratégies de dégradation, la gestion des fournisseurs externes et les revues d’architecture. Elle aide aussi à clarifier les responsabilités : non pas pour désigner une équipe fautive, mais pour savoir qui peut agir sur quelle partie du contrat.

## La fiabilité vit dans les relations

Les systèmes distribués échouent rarement de façon parfaitement locale. Une dégradation se propage, se transforme et apparaît parfois loin de son origine. Tant que l’observabilité reste centrée sur des composants isolés, les équipes doivent reconstruire ces relations sous pression.

Observer une dépendance consiste à rapprocher ce que voit l’appelant, ce que fait l’appelé et ce que subissent les ressources sous-jacentes. Les Golden Signals, RED et USE deviennent alors les trois faces d’un même raisonnement plutôt qu’une collection de tableaux de bord.

Le véritable progrès ne consiste pas à collecter davantage de signaux. Il consiste à les organiser autour du chemin que parcourt une requête et du contrat qui relie les composants. Car dans un système distribué, la fiabilité n’habite pas seulement les services : elle habite les relations entre eux.
