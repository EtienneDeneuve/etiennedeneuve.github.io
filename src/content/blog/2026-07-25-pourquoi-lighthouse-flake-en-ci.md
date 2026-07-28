---
title: "Pourquoi Lighthouse flake en CI — et pourquoi baisser le seuil est rarement la bonne réponse"
description: "Une pull request ne change presque rien au front-end, mais le contrôle Lighthouse passe de 92 à 78. On relance le job : 89. Une troisième fois : 94. La réaction habituelle…"
pubDate: 2026-10-13T09:00:00.000Z
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


Une pull request ne change presque rien au front-end, mais le contrôle Lighthouse passe de 92 à 78. On relance le job : 89. Une troisième fois : 94. La réaction habituelle consiste soit à accuser Lighthouse, soit à abaisser le seuil jusqu’à retrouver une CI verte.

Ces deux réponses ratent le vrai problème. Lighthouse n’est ni un test déterministe classique, ni un oracle de l’expérience utilisateur. C’est un instrument de mesure synthétique exécuté dans un environnement qui, en CI, est souvent instable. Pour l’utiliser correctement, il faut cesser de traiter son score comme un verdict et commencer à le lire comme un signal.

## Le mauvais modèle mental : « même code, même score »

Un test unitaire reçoit des entrées contrôlées et vérifie une sortie précise. À code identique, il doit produire le même résultat. Une mesure de performance obéit à une autre logique : elle observe un système pendant une fenêtre de temps, sous certaines conditions de calcul, de réseau et de chargement.

Sur un agent CI éphémère, ces conditions varient. Le processeur peut être partagé avec d’autres charges. Le navigateur ne démarre pas toujours dans le même état. Le cache, la résolution DNS, les polices, les images ou les scripts tiers peuvent répondre à des vitesses différentes. Même l’ordonnancement de tâches concurrentes dans le navigateur déplace parfois un jalon de quelques centaines de millisecondes.

Or le score Lighthouse n’est pas une moyenne directe des temps observés. Il agrège plusieurs métriques, avec des pondérations et des courbes de notation. Une petite variation autour d’une zone sensible peut donc provoquer un écart de score visible, sans transformation équivalente de l’expérience réelle.

Le modèle « même code, même score » conduit alors à une fausse alternative : soit le produit a régressé, soit l’outil est mauvais. En réalité, une exécution mesure toujours au moins trois composantes :

> résultat observé = comportement du produit + conditions d’exécution + bruit de mesure

La CI devient utile lorsqu’elle aide à distinguer ces composantes, pas lorsqu’elle prétend que les deux dernières n’existent pas.

## Trois types d’échec à ne pas confondre

### 1. La régression produit

Une nouvelle dépendance alourdit le JavaScript initial, une image héroïque n’est plus optimisée, une police bloque le rendu ou une animation monopolise le thread principal. Le signal est alors cohérent : la dégradation se reproduit, touche des métriques explicables et correspond à un changement du produit.

C’est précisément le cas que le garde-fou doit bloquer.

### 2. Le bruit d’infrastructure

Le même artefact, exécuté plusieurs fois, donne des résultats dispersés. Une seule métrique temporelle se dégrade brièvement, puis revient à son niveau habituel sans changement de code. L’agent partagé, le navigateur ou une ressource externe sont probablement en cause.

Ce bruit n’est pas une raison pour abandonner la mesure. Il indique que le protocole expérimental est trop faible pour la précision qu’on lui demande.

### 3. Le seuil mal calibré

Un seuil fixé exactement au niveau habituel transforme la moindre variance en panne. À l’inverse, un seuil très bas laisse passer les vraies dérives. Dans les deux cas, le problème n’est pas Lighthouse mais l’absence de marge entre la performance normale et la limite jugée inacceptable.

Un bon seuil n’exprime pas « le meilleur score déjà vu ». Il matérialise une frontière de qualité défendable.

## Concevoir une mesure, pas seulement ajouter un job

Rendre Lighthouse fiable en CI commence par la répétabilité du contexte. Il faut mesurer le même artefact, servi de la même manière, avec un navigateur et une configuration maîtrisés. Les dépendances externes non essentielles doivent être neutralisées ou stabilisées autant que possible. Sinon, le contrôle évalue autant Internet et l’agent d’exécution que l’application.

Ensuite vient la répétition. Une exécution unique répond à la question : « qu’ai-je observé cette fois-ci ? » Plusieurs exécutions permettent de demander : « quel comportement est typique, et quelle est sa dispersion ? » Une médiane ou une autre agrégation robuste réduit le pouvoir d’un incident isolé. Cela coûte quelques minutes, mais évite souvent bien davantage de temps perdu en relances et en faux diagnostics.

La répétition ne doit toutefois pas servir à piocher le meilleur résultat jusqu’à obtenir du vert. Répéter pour caractériser une distribution est une démarche de mesure ; répéter jusqu’au succès est une manière de masquer l’instabilité.

Enfin, toutes les assertions ne méritent pas la même tolérance. Certaines propriétés sont presque déterministes : présence de texte alternatif, absence d’erreurs structurelles, respect de règles d’accessibilité ou taille maximale d’un artefact local. Elles peuvent être strictes. Les métriques temporelles, elles, demandent une marge et une lecture statistique.

Mélanger ces deux familles dans un score global unique affaiblit le contrôle. Une bonne politique sépare les invariants du produit des indicateurs sensibles à l’environnement.

## Une checklist de garde-fou crédible

Avant de rendre un score bloquant, je vérifie six points :

1. **Artefact identique** — le test porte sur le build destiné au déploiement, pas sur un serveur de développement au comportement différent.
2. **Contexte maîtrisé** — version du navigateur, mode de service, routes testées et configuration de Lighthouse sont explicites.
3. **Dépendances externes connues** — les tiers indispensables sont identifiés ; les autres ne dictent pas aléatoirement l’état de la CI.
4. **Répétitions suffisantes** — le résultat représente une tendance, pas un tirage unique.
5. **Seuils avec marge** — la limite est éloignée du bruit normal et reliée à un niveau de qualité réellement attendu.
6. **Diagnostic lisible** — en cas d’échec, l’équipe voit les métriques en cause et conserve les rapports nécessaires à la comparaison.

J’ajoute un septième critère organisationnel : surveiller le taux de faux positifs. Un garde-fou fréquemment relancé sans analyse perd rapidement toute autorité. Dès que l’équipe apprend que « ça passe au deuxième essai », le contrôle existe encore dans le pipeline, mais plus dans les décisions.

## Le score global est une alarme, pas un diagnostic

Un score synthétique est pratique pour trier rapidement les situations. Il est insuffisant pour expliquer une régression. Deux pages notées 85 peuvent avoir des problèmes complètement différents : rendu initial lent, instabilité visuelle, blocage du thread principal ou ressources trop lourdes.

Lorsqu’une alarme se déclenche, il faut descendre d’un niveau : quelle métrique a bougé ? Sur quelles exécutions ? Avec quelle dispersion ? Quel changement récent peut l’expliquer ? La dégradation concerne-t-elle une route ou tout le site ?

Cette discipline évite aussi l’optimisation cosmétique. Chercher quelques points de score sans comprendre la métrique favorise les ajustements qui améliorent le benchmark mais pas nécessairement l’utilisateur. Le but n’est pas de satisfaire Lighthouse. Le but est de protéger une expérience, Lighthouse étant l’un des instruments disponibles.

## Un principe qui dépasse Lighthouse

Le même raisonnement s’applique aux tests de charge, aux benchmarks de compilation, aux contrôles de latence d’API et même à certains tests end-to-end. Plus un test dépend du temps, du réseau, d’un navigateur ou d’une infrastructure partagée, moins il peut être interprété comme une simple fonction du code.

Une CI mature ne cherche donc pas à rendre toute mesure artificiellement déterministe. Elle classe les signaux selon leur nature : invariant strict, budget avec tolérance, tendance à surveiller ou diagnostic non bloquant. Elle réserve le rouge aux situations où la probabilité d’une vraie régression est suffisamment forte pour interrompre le flux.

Baisser un seuil à chaque flake soulage le pipeline, mais détruit progressivement le garde-fou. Exiger une valeur parfaite sur un agent instable produit l’effet inverse : une alarme permanente que tout le monde ignore.

La voie robuste se trouve entre les deux. Stabiliser le protocole, mesurer plusieurs fois, calibrer la marge sur la variance observée et diagnostiquer les métriques plutôt que le seul score. Lighthouse redevient alors ce qu’il doit être : non pas un juge infaillible, mais un capteur suffisamment fiable pour éclairer une décision d’ingénierie.
