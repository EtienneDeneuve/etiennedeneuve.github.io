---
title: "Comment j’ai accompagné l’instrumentation OpenTelemetry d’environ 200 services"
description: "Retour terrain sur une migration brownfield : task force, ateliers, assistants de code, conventions communes et validation progressive sans refonte générale."
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

Sur un schéma d’architecture, instrumenter 200 services tient dans une flèche.

Dans la vraie vie, une partie de ces services a quinze ans d’histoire.

Il y a plusieurs langages, plusieurs générations de code, des bibliothèques communes qui n’ont pas toutes été conçues pour l’observabilité moderne, et une couverture de tests qui ressemble à celle de beaucoup d’applications historiques : suffisante pour avancer, mais pas assez pour prétendre qu’on peut modifier n’importe quoi sans précaution.

Le piège aurait été de transformer OpenTelemetry en grand programme de refonte.

Ce n’était ni nécessaire, ni réaliste.

Mon rôle a donc surtout consisté à construire un cadre qui permette aux équipes de faire évoluer l’instrumentation rapidement, sans leur demander de réécrire leurs services.

## Le premier objectif était la couverture

Dans un système brownfield, on peut facilement passer trois semaines à définir le modèle de traces parfait pour six services.

Pendant ce temps, les 194 autres continuent à produire peu ou pas de télémétrie exploitable.

J’ai donc poussé une logique assez simple : **obtenir une instrumentation cohérente sur l’ensemble du parc avant de chercher la sophistication partout**.

Cela ne veut pas dire instrumenter n’importe comment.

Cela veut dire décider d’un socle minimum, le rendre reproductible, puis améliorer la qualité au fur et à mesure que les usages deviennent réels.

Le premier passage devait notamment répondre à des questions basiques :

- le service émet-il correctement ses traces ?
- les identifiants de corrélation sont-ils présents ?
- les erreurs sont-elles visibles ?
- les appels externes et SQL sont-ils correctement représentés ?
- les logs peuvent-ils être reliés au contexte de trace ?
- le service se comporte-t-il exactement comme avant après instrumentation ?

Ce dernier point est essentiel.

Une migration d’observabilité n’a aucune valeur si elle introduit des régressions dans le produit qu’elle est censée aider à comprendre.

## Une task force plutôt qu’un document de 80 pages

Nous avons mis en place une petite task force pour accompagner la R&D.

L’objectif n’était pas de devenir propriétaire de chaque service à la place des équipes.

Il fallait plutôt réduire le coût de la migration pour elles.

Nous avons donc travaillé avec plusieurs leviers en parallèle :

- ateliers dédiés pour expliquer OpenTelemetry et les conventions retenues ;
- exemples concrets dans les langages utilisés ;
- aide directe sur les premières implémentations ;
- revue des PR avec les équipes ;
- validation en environnement de développement ;
- consignes réutilisables dans les assistants de code.

Ce dernier point a beaucoup accéléré le travail.

## Utiliser Cursor ou Claude comme multiplicateur, pas comme architecte

Pour une migration de ce type, un assistant de code est particulièrement efficace sur les tâches répétitives.

Il peut retrouver les points d’initialisation, ajouter un SDK, injecter une configuration, propager un contexte ou reproduire un pattern déjà validé.

Mais je ne voulais surtout pas que chaque développeur demande simplement :

> "Ajoute OpenTelemetry dans ce service."

Cette consigne laisse trop de décisions ouvertes.

Nous avons plutôt préparé un skill ou un ensemble d’instructions décrivant **comment nous voulions qu’OpenTelemetry soit implanté dans ce code**.

L’assistant devait suivre la convention décidée par les humains, pas en inventer une nouvelle à chaque dépôt.

La différence est importante.

Un LLM est très bon pour industrialiser une convention.

Il est beaucoup moins intéressant pour inventer 200 fois la convention.

## Réduire le changement au minimum utile

L’application étant ancienne, nous avons aussi cherché à limiter la surface de modification.

Il n’était pas question de profiter de la migration OpenTelemetry pour reprendre chaque module, chaque abstraction ou chaque bibliothèque qui nous semblait perfectible.

Ce genre de chantier finit rapidement par ne plus être un projet d’observabilité.

Pour chaque service, la question était plutôt :

**quel est le plus petit changement propre qui permet d’obtenir les signaux attendus sans modifier le comportement fonctionnel ?**

Dans certains cas, cela passe par le SDK OpenTelemetry.

Dans d’autres, par l’auto-instrumentation.

Pour les logs, nous avons également modifié une bibliothèque commune afin d’ajouter les informations nécessaires à la corrélation, plutôt que de demander à chaque service de réinventer le même format.

Le résultat n’est pas une architecture académique parfaite.

C’est une migration qui peut réellement avancer.

## PR par PR, service par service

La validation n’avait rien de spectaculaire.

Une modification est proposée.

Elle est relue avec l’équipe.

Elle est déployée en développement.

On vérifie les traces, les logs, les métriques et surtout le comportement du service.

Puis on corrige si nécessaire.

Les tests automatiques restent importants, mais sur une application de quinze ans, prétendre qu’ils couvrent parfaitement chaque scénario serait peu crédible.

Il faut donc compléter avec l’observation réelle du service instrumenté.

Cette méthode a permis d’avancer sur environ 200 services en quelques semaines.

Ce résultat ne vient pas d’une automatisation magique.

Il vient surtout du fait que les décisions répétitives avaient été prises une fois, puis rendues faciles à appliquer.

## Les premières traces ont immédiatement trouvé des choses intéressantes

Même avant d’aller loin dans les spans métier, les traces techniques ont apporté de la valeur.

La partie C++ en est un bon exemple.

Nous avons retrouvé des requêtes SQL mal gérées qui participaient à des consommations mémoire et CPU anormales.

Nous avons aussi identifié des appels répétés qui auraient dû bénéficier d’un cache.

Ce ne sont pas des problèmes extraordinaires.

C’est justement ce qui rend l’exemple utile.

Dans une application ancienne, une grande partie des problèmes de performance vient rarement d’un mécanisme exotique. On retrouve des appels trop fréquents, des requêtes mal maîtrisées, des dépendances lentes ou une logique qui a grossi avec les années.

Les métriques peuvent montrer qu’un service consomme trop.

Une trace aide souvent à comprendre **où le temps et les ressources partent réellement**.

## Ajouter des spans métier, mais sans bloquer la migration

L’auto-instrumentation et les bibliothèques standards donnent d’abord une vision technique.

On voit un appel HTTP, une requête SQL, une dépendance externe.

C’est déjà utile, mais cela ne raconte pas toujours ce que l’application est en train de faire.

Nous avons donc commencé à aider les équipes à ajouter quelques spans métier lorsque cela apportait du sens.

Pas partout.

Pas sur chaque fonction.

Pas avec l’ambition immédiate de reconstruire un modèle fonctionnel complet dans les traces.

L’objectif était plutôt d’apprendre aux équipes à reconnaître les moments où un span supplémentaire permet de mieux comprendre un traitement.

Cette progression est volontaire.

Si on exige dès la première PR une taxonomie métier complète, un modèle de noms parfait et une instrumentation manuelle très détaillée, la migration ralentit fortement.

Je préfère généralement obtenir une couverture correcte, puis enrichir les zones où les traces sont réellement utilisées.

L’usage révèle très vite les trous du modèle.

## La corrélation logs-traces change aussi la manière de déboguer

Une autre évolution importante a été la normalisation des logs.

Nous avons adapté une bibliothèque commune pour injecter les éléments nécessaires à la corrélation avec les traces.

L’intérêt n’est pas de rendre les logs plus "OpenTelemetry".

L’intérêt est de pouvoir partir d’un symptôme visible dans une trace et retrouver immédiatement les événements produits par le service concerné, ou faire le chemin inverse depuis un log.

Cette continuité réduit beaucoup les ruptures pendant un diagnostic.

Sans corrélation, on passe son temps à reconstruire le contexte avec des timestamps, des noms de pods, des identifiants fonctionnels ou des recherches manuelles.

Avec une corrélation propre, une partie de ce travail disparaît.

Mais cette normalisation a aussi révélé un autre sujet : les données qu’on ne veut surtout pas propager.

J’y reviendrai dans l’article suivant.

## L’auto-instrumentation est un accélérateur, pas une stratégie complète

L’OpenTelemetry Operator permet d’injecter automatiquement l’instrumentation sur Kubernetes.

C’est très pratique pour homogénéiser certains paramètres et accélérer la couverture.

Nous l’avons utilisé comme un levier parmi d’autres.

Mais il faut garder une frontière claire entre :

- obtenir rapidement des signaux techniques ;
- construire une observabilité réellement utile à l’équipe.

L’auto-instrumentation sait capturer beaucoup de choses.

Elle ne sait pas décider seule quelles opérations métier méritent un span, quels attributs sont réellement stables, ni quelles informations risquent de devenir dangereuses plus loin dans le pipeline.

Cette distinction devient importante dès que les volumes augmentent.

Parce qu’une information qui paraît anodine dans une trace peut ensuite devenir un sérieux problème de cardinalité.

## La règle que je retiens pour une migration brownfield

Je résumerais la méthode ainsi :

**standardiser assez pour avancer vite, mais pas au point de bloquer sur un modèle parfait.**

Le cadre doit être ferme sur ce qui protège la plateforme :

- initialisation cohérente ;
- propagation du contexte ;
- conventions minimales ;
- corrélation ;
- gestion des erreurs ;
- données sensibles ;
- validation avant production.

Il peut rester progressif sur ce qui dépend fortement du métier :

- finesse des spans ;
- attributs fonctionnels ;
- taxonomie complète ;
- couverture détaillée des traitements historiques.

C’est ce compromis qui permet à l’observabilité de devenir un travail d’équipe plutôt qu’une migration imposée par la plateforme.

Et c’est également ce qui nous a permis de découvrir rapidement la prochaine difficulté : quand on commence à collecter beaucoup mieux, on découvre aussi qu’on peut très facilement collecter beaucoup trop.

## Suite

[3/4 : Cardinalité, PII et sampling : quand l’observabilité commence à se manger elle-même](/2026-09-22-opentelemetry-cardinalite-pii-sampling)

## Sources officielles

- [OpenTelemetry : instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/)
- [OpenTelemetry Operator : auto-instrumentation](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/)
- [OpenTelemetry : contexte et propagation](https://opentelemetry.io/docs/concepts/context-propagation/)
- [OpenTelemetry : traces](https://opentelemetry.io/docs/concepts/signals/traces/)
