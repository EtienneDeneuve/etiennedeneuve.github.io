---
title: "Pourquoi j’ai proposé OpenTelemetry pendant une migration vers Dynatrace"
description: "Le client migrait vers Dynatrace, mais l’instrumentation C++ devait être reprise. J’ai proposé OpenTelemetry pour éviter de recoller l’application à un nouveau backend."
pubDate: 2026-09-22T21:20:00.000Z
language: fr
contentType: architecture-decision
pillar: observability
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - OpenTelemetry
  - Observability
  - Dynatrace
  - Grafana Alloy
  - Platform Engineering
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-09-22-opentelemetry-instrumenter-200-services
  - 2026-09-22-opentelemetry-cardinalite-pii-sampling
  - 2026-09-22-opentelemetry-exploiter-la-plateforme
  - 2026-07-06-observabilite-contrat-testable
---

> Série **OpenTelemetry en production**, 1/4. La suite : [instrumenter environ 200 services sans refaire l’application](/2026-09-22-opentelemetry-instrumenter-200-services).

Le contexte de départ était assez simple : le client migrait vers Dynatrace, Prometheus et Grafana existaient déjà, et une partie importante de l’application était en C++.

Le problème est arrivé avec l’instrumentation. Le SDK propriétaire utilisé jusque-là côté C++ devait être remplacé. Il fallait donc retoucher du code pour conserver les traces.

À ce moment-là, deux options étaient possibles : repartir directement sur le SDK du nouveau backend, ou profiter du chantier pour découpler l’instrumentation du stockage.

J’ai proposé OpenTelemetry.

Pas pour remettre en cause Dynatrace. Le client avait choisi sa trajectoire et mon rôle n’était pas de la redécider. L’idée était plus pragmatique : si on doit déjà toucher au code, autant éviter de refaire la même opération au prochain changement d’outil, de contrat ou de modèle de coût.

## Le sujet n’était pas de remplacer Dynatrace

Dynatrace devait recevoir les logs, les métriques et les traces attendus. Ce point ne changeait pas.

En revanche, je ne voyais pas d’intérêt à ce que l’application sache que ces signaux étaient destinés à Dynatrace.

C’est là qu’OpenTelemetry devient intéressant. Les applications émettent avec un contrat commun. La plateforme collecte, transforme et route. Le backend reste un choix d’exploitation.

Ça ne rend pas les outils interchangeables. Les requêtes, les dashboards, l’alerting, la rétention et les fonctions propriétaires restent spécifiques. Passer de Dynatrace à Tempo n’est évidemment pas un changement d’URL.

Mais réinstrumenter 200 services juste pour changer de destination est un autre problème. C’est celui que je voulais éviter.

## Ne pas casser ce qui marche déjà

Prometheus et Grafana étaient déjà utilisés pour exploiter la plateforme. Il n’y avait aucune raison de jeter ça au début de la migration.

Même chose pour Splunk : certains dashboards de logs existaient encore et n’avaient pas été migrés. Il devait donc rester dans la boucle tant que ces usages n’étaient pas repris ailleurs.

La trajectoire proposée ressemblait à ça :

~~~mermaid
flowchart LR
    A[Applications et runtimes] --> B[OpenTelemetry]
    B --> C[Grafana Alloy]

    C --> D[VictoriaMetrics]
    C --> E[Tempo]
    C --> F[Loki]
    C --> G[Dynatrace]
    C --> H[Splunk pendant la transition]

    D --> I[Grafana]
    E --> I
    F --> I
~~~

Le schéma est volontairement simplifié. Alloy n’est pas déployé d’une seule façon partout, et tous les signaux ne suivent pas exactement le même chemin.

La règle, elle, est simple : une destination reçoit les données dont elle a besoin. Pas tout, partout, par défaut.

Dynatrace reçoit ce qui est attendu par la cible du client. Grafana reste utile aux équipes plateforme. Splunk continue uniquement le temps de migrer les dashboards qui en dépendent.

## Pourquoi Alloy

On aurait pu rester sur l’OpenTelemetry Collector upstream. J’ai préféré proposer Alloy parce que le besoin dépassait déjà OTLP.

Il fallait faire cohabiter OpenTelemetry, les métriques Prometheus et plusieurs sources techniques. Alloy fournit les composants nécessaires dans le même modèle de configuration, avec notamment des exporters utiles pour Azure, SQL Server ou MongoDB.

Il se déploie aussi assez librement : DaemonSet, Deployment, gateway, plusieurs instances avec des rôles différents. L’interface web aide à comprendre ce qui tourne et comment les composants sont reliés.

Ce n’est pas une vérité générale sur Alloy. Dans ce contexte précis, il évitait surtout d’empiler un outil différent pour chaque source.

## Brownfield : ouvrir d’abord, resserrer ensuite

Sur une plateforme neuve, je partirais beaucoup plus fermé : peu d’attributs, peu de destinations, des règles de cardinalité et de données sensibles définies dès le départ.

Sur une application qui a quinze ans, faire ça brutalement est risqué.

Un champ qu’on croit inutile peut alimenter un dashboard dont personne n’a parlé. Une source historique peut encore servir à une équipe. Couper avant d’avoir observé les usages, c’est surtout une bonne manière de créer un incident de migration.

La démarche était donc plutôt :

1. standardiser l’émission ;
2. rendre les flux visibles ;
3. conserver les usages connus ;
4. migrer les consommateurs ;
5. supprimer ce qui n’a plus d’usage ;
6. resserrer progressivement.

C’est moins joli pendant quelques semaines, mais beaucoup plus sain qu’un big bang d’observabilité.

## Ce que je cherchais vraiment à obtenir

Le but n’était pas de fabriquer une "stack Grafana".

Je cherchais à séparer quatre responsabilités :

- l’application décrit ce qu’elle fait ;
- la plateforme collecte et route ;
- les backends stockent et exploitent ;
- le client choisit les outils qu’il veut garder.

Cette séparation laisse plus de marge pour la suite. Elle permet aussi de répondre à la migration Dynatrace sans perdre l’existant Grafana ni transformer le code applicatif en catalogue de SDK fournisseurs.

Le vrai chantier commençait juste après : il fallait appliquer ce modèle à environ 200 services sans refaire quinze ans de code.

## Suite

[2/4 : OpenTelemetry sur 200 services : couvrir vite sans refaire quinze ans de code](/2026-09-22-opentelemetry-instrumenter-200-services)

## Sources officielles

- [OpenTelemetry : architecture du Collector](https://opentelemetry.io/docs/collector/architecture/)
- [OpenTelemetry Operator for Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/operator/)
- [Grafana Alloy : fonctionnement](https://grafana.com/docs/alloy/latest/introduction/how-alloy-works/)
- [Grafana Alloy : composants Prometheus](https://grafana.com/docs/alloy/latest/reference/components/prometheus/)
