---
title: "GitOps : pourquoi une seule source de vérité ne signifie pas un seul dépôt"
description: "« Il nous faut une seule source de vérité. » La formule paraît saine. Dans une plateforme GitOps, elle promet des déploiements reproductibles, des changements audités et la fin…"
pubDate: 2026-09-29T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
  - GitOps
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


« Il nous faut une seule source de vérité. » La formule paraît saine. Dans une plateforme GitOps, elle promet des déploiements reproductibles, des changements audités et la fin des modifications manuelles impossibles à retracer. Puis vient souvent une conclusion beaucoup plus discutable : puisque la vérité doit être unique, toutes les définitions — charts, valeurs applicatives, politiques de plateforme et promotions d’environnements — devraient vivre dans un même dépôt.

C’est confondre unicité de l’autorité et unicité du contenant.

Une plateforme n’a pas besoin d’un dépôt universel. Elle a besoin d’une réponse non ambiguë à une question plus précise : **pour chaque préoccupation, quel système fait autorité ?** La différence semble sémantique. Elle détermine pourtant la capacité à faire évoluer la plateforme sans créer un monolithe Git, à déléguer sans perdre le contrôle et à diagnostiquer un déploiement sans mener une enquête archéologique.

## Le mauvais réflexe : fabriquer un monolithe pour supprimer l’ambiguïté

Le dépôt unique séduit parce qu’il donne une représentation très simple du système : tout est au même endroit, donc tout serait cohérent. Mais la proximité des fichiers ne crée ni cohérence opérationnelle ni autorité claire.

Dans un dépôt monolithique, plusieurs cycles de vie se retrouvent artificiellement couplés :

- le packaging d’un composant évolue avec ses propres versions et compatibilités ;
- la configuration d’une application dépend de son équipe et de ses besoins métier ;
- la plateforme impose des invariants transverses ;
- la promotion vers un environnement répond à des règles de risque et de validation.

Ces changements n’ont ni les mêmes propriétaires, ni la même fréquence, ni le même niveau de risque. Les rassembler peut simplifier la recherche de fichiers, mais complique les droits d’écriture, les revues et les retours arrière. Une modification du modèle de packaging et une promotion en production deviennent deux changements voisins alors qu’ils ne portent pas la même décision.

Le problème apparaît aussi dans l’autre direction. Multiplier les dépôts sans définir leur autorité produit une plateforme où plusieurs endroits prétendent décrire le même état. Une valeur par défaut dans un chart, une surcharge dans un dépôt applicatif et une correction dans un dépôt d’environnement peuvent toutes sembler « vraies ». GitOps ne supprime alors pas l’ambiguïté : il l’automatise.

Le choix n’est donc pas entre un dépôt et plusieurs. Il est entre **une autorité explicite** et **des autorités concurrentes**.

## Le bon modèle mental : une source de vérité par préoccupation

Je préfère représenter un système GitOps comme une chaîne de contrats plutôt que comme une arborescence de dépôts. Chaque maillon possède une responsabilité distincte.

### 1. Le packaging décrit ce qui peut être déployé

Un chart, un bundle ou tout autre paquet déclaratif définit la structure d’un composant : ressources attendues, paramètres exposés, valeurs par défaut raisonnables et contraintes de compatibilité. Son autorité porte sur le **modèle déployable**, pas sur la décision d’installer une version précise dans un environnement précis.

Le paquet doit être versionné comme un produit. Une version publiée devient une référence immuable. Cela permet à plusieurs applications ou environnements de consommer le même contrat sans copier sa définition.

### 2. La configuration applicative décrit l’intention du service

L’équipe responsable d’une application doit pouvoir exprimer ce qui lui appartient : paramètres fonctionnels, dépendances activées, dimensionnement attendu ou options propres au service. Cette configuration ne devrait pas redéfinir silencieusement le packaging ni contourner les invariants de la plateforme.

Son autorité porte sur **l’intention applicative**. Elle peut vivre près du code ou dans un dépôt distinct selon l’organisation ; le critère important n’est pas la topologie Git, mais l’identité du propriétaire et la clarté du contrat.

### 3. La plateforme décrit les invariants communs

La plateforme fixe les règles qui ne doivent pas dépendre du bon vouloir de chaque équipe : conventions de déploiement, contrôles d’admission, politiques de disponibilité, intégration à l’observabilité ou exigences de sécurité. Elle fournit aussi les mécanismes qui composent packaging et configuration.

Son autorité porte sur **les garde-fous et le mode d’exécution**, pas sur la configuration métier des applications.

### 4. La promotion décrit ce qui doit tourner ici et maintenant

Enfin, une source d’autorité doit répondre à la question opérationnelle : quelle version de quel artefact est attendue dans chaque environnement ? Cette décision devrait référencer des versions immuables, et non reconstruire implicitement un paquet depuis l’état courant d’une branche.

La promotion devient alors un changement lisible : passer d’une version connue à une autre, avec un diff réduit et un retour arrière compréhensible. Son autorité porte sur **l’état désiré d’un environnement**.

Ce découpage ne prescrit pas quatre dépôts. Deux préoccupations peuvent partager un dépôt si leurs propriétaires, leurs droits et leurs cycles de vie sont compatibles. Inversement, une même préoccupation peut être répartie physiquement entre plusieurs dépôts si une règle d’autorité permet de déterminer sans ambiguïté la valeur finale. Le dépôt est une unité d’organisation ; l’autorité est une propriété du système.

## Une matrice d’autorité vaut mieux qu’un slogan

Avant une migration GitOps, il est utile de construire une matrice très simple. Pour chaque type de décision, elle indique :

- le propriétaire responsable ;
- l’emplacement faisant autorité ;
- l’artefact ou la référence consommée ;
- le mécanisme de validation ;
- le droit d’approuver une modification ;
- la stratégie de retour arrière.

Cette matrice révèle rapidement les zones grises. Qui décide de la version d’un paquet ? Une valeur peut-elle être définie à deux niveaux ? Une équipe applicative peut-elle modifier un invariant de plateforme ? La production suit-elle une branche mouvante ou une référence immuable ? Si deux réponses sont possibles, le problème n’est pas encore résolu.

Elle permet aussi de distinguer deux notions souvent mélangées : **l’origine d’une définition** et **le calcul de l’état final**. Un contrôleur GitOps peut composer plusieurs sources tout en conservant une autorité claire, à condition que les règles de précédence soient intentionnelles, limitées et observables. En revanche, une cascade de surcharges dont personne ne maîtrise l’ordre produit une vérité techniquement calculable mais humainement incompréhensible.

## Les critères d’une architecture GitOps saine

Une bonne séparation se vérifie moins au nombre de dépôts qu’à quelques propriétés concrètes.

**Une décision, un propriétaire.** Chaque classe de changement possède une équipe responsable et un chemin de revue adapté. La délégation ne signifie pas l’absence de contrôle ; elle signifie que le contrôle se trouve au bon niveau.

**Des références immuables entre les couches.** La configuration et la promotion consomment des versions identifiables. Elles ne dépendent pas d’un contenu qui peut changer sans que la référence change.

**Un diff qui raconte la décision.** Une promotion doit ressembler à une promotion. Une évolution du packaging doit ressembler à une évolution du packaging. Lorsque le diff mélange les deux, l’audit et le rollback deviennent plus risqués.

**Une composition reproductible.** Il doit être possible de calculer et valider l’état désiré avant son application. La séparation des responsabilités n’excuse pas un assemblage opaque réservé au contrôleur dans le cluster.

**Une dérive attribuable.** Lorsqu’un état observé ne correspond pas à l’état désiré, on doit pouvoir identifier la couche responsable : paquet, configuration, règle de plateforme ou promotion. Sans cette attribution, les équipes se renvoient la propriété de l’incident.

**Des tests alignés sur les contrats.** Le packaging se teste comme un paquet versionné ; la configuration se valide contre son schéma et ses politiques ; la promotion se vérifie comme une transition entre deux états connus. Séparer les préoccupations ne rend pas les tests plus difficiles : cela évite qu’un unique test d’intégration tardif porte toute la confiance du système.

## La topologie des dépôts est une conséquence, pas une architecture

Un petit nombre d’équipes et de services peut fonctionner efficacement avec un mono-repo, tant que les frontières d’autorité y sont explicites. Une grande organisation choisira souvent plusieurs dépôts pour isoler les droits, les cadences et les responsabilités. Les deux modèles peuvent être GitOps. Les deux peuvent aussi échouer.

Le piège consiste à faire de la topologie Git une décision de premier ordre. On débat alors de mono-repo contre multi-repo avant d’avoir défini les contrats, les propriétaires et le modèle de promotion. C’est prendre le plan de classement pour le système de gouvernance.

GitOps apporte de la valeur lorsque Git devient l’interface auditable de décisions opérationnelles explicites. Il ne demande pas que toutes ces décisions soient écrites au même endroit. Il demande que chacune ait un endroit incontestable, un propriétaire identifiable et un chemin reproductible jusqu’à l’état exécuté.

La « single source of truth » n’est donc pas un dépôt central. C’est une discipline : **une seule autorité pour chaque question, et des contrats clairs entre les réponses**.
