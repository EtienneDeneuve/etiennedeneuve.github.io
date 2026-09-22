---
title: "Pourquoi j’ai proposé OpenTelemetry à un client qui migrait vers Dynatrace"
description: "Retour terrain sur une décision d’architecture : respecter une migration Dynatrace tout en découplant l’instrumentation applicative du backend d’observabilité."
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

> Série **OpenTelemetry en production**, 1/4. La suite : [accompagner l’instrumentation d’environ 200 services](/2026-09-22-opentelemetry-instrumenter-200-services).

Je ne suis pas arrivé chez ce client avec l’idée de remplacer Dynatrace par une stack open source.

La demande allait même dans l’autre sens : une migration vers Dynatrace était engagée, et mon rôle était d’aider les équipes à la rendre viable sans perdre ce qui fonctionnait déjà.

La plateforme utilisait Prometheus et Grafana depuis un moment. Certaines vues étaient réellement utiles pour exploiter la plateforme. En parallèle, une partie de l’application était en C++, avec une instrumentation propriétaire qu’il fallait reprendre.

À ce moment-là, il était possible de faire le choix le plus direct : réinstrumenter le C++ spécifiquement pour la nouvelle cible, puis continuer.

J’ai proposé OpenTelemetry à la place.

Pas pour contourner la décision du client. Pas pour imposer une nouvelle stack. Mais parce que, quitte à réinstrumenter une application importante et à toucher progressivement à environ 200 services, il me semblait préférable que cette instrumentation appartienne à la plateforme plutôt qu’au prochain fournisseur d’observabilité.

Le client décide de sa trajectoire. Mon rôle est de rendre les conséquences techniques visibles et de proposer une architecture qui lui laisse des options.

## Le problème n’était pas Dynatrace

Il est facile de transformer ce genre de sujet en débat "open source contre SaaS". Ce n’était pas le problème.

Dynatrace devait recevoir les logs, les métriques et les traces attendus. C’était une contrainte du projet et elle devait être respectée.

Le problème était ailleurs : **est-ce que l’application devait connaître Dynatrace pour produire sa télémétrie ?**

Si la réponse est oui, chaque évolution du backend peut redevenir un sujet applicatif.

Si la réponse est non, l’application peut produire des signaux selon un contrat plus stable, et la plateforme peut ensuite décider où les envoyer.

C’est précisément la séparation que j’attendais d’OpenTelemetry.

OpenTelemetry ne remplace pas Dynatrace. Il ne remplace pas Tempo, Loki ou VictoriaMetrics non plus. Il fournit des API, des SDK, un protocole et un modèle de collecte qui permettent de découpler l’émission des signaux de leur destination finale.

La différence paraît petite sur un schéma. Elle devient importante lorsqu’on raisonne sur plusieurs années.

## Conserver ce qui fonctionnait déjà

Une migration réussie ne commence pas nécessairement par supprimer l’existant.

Prometheus et Grafana rendaient déjà des services aux équipes plateforme. Les abandonner immédiatement n’aurait apporté aucune valeur en soi.

Splunk était également encore présent pour des dashboards de logs qui n’avaient pas tous été migrés. Là encore, couper la source parce qu’une nouvelle cible existe aurait simplement cassé des usages dont nous n’avions pas encore prouvé qu’ils étaient devenus inutiles.

La trajectoire que j’ai proposée était donc volontairement progressive.

~~~mermaid
flowchart LR
    A[Applications et runtimes] --> B[OpenTelemetry]
    B --> C[Grafana Alloy]

    C --> D[VictoriaMetrics]
    C --> E[Tempo]
    C --> F[Loki]
    C --> G[Dynatrace]
    C --> H[Splunk temporairement pour certains logs]

    D --> I[Grafana]
    E --> I
    F --> I
~~~

Le dessin simplifie la réalité, mais le principe est là.

Les applications produisent des signaux selon un contrat commun. La couche de collecte applique les transformations, les filtres et le routage. Les backends reçoivent ce dont ils ont besoin.

Dynatrace peut donc être alimenté comme demandé, tout en conservant Grafana pour les usages plateforme. Splunk peut rester le temps de migrer certains dashboards, puis disparaître lorsque son usage n’est plus nécessaire.

On ne construit pas une architecture propre en supprimant ce qui semble ancien. On la construit en supprimant ce dont on a prouvé qu’on n’a plus besoin.

## Le backend redevient une décision de plateforme

C’est le point architectural qui m’intéressait le plus.

Lorsque le code applicatif dépend directement d’un SDK propriétaire pour exprimer une trace, le choix du backend remonte jusque dans le produit.

Avec OpenTelemetry, on peut réduire cette dépendance.

Cela ne rend pas les backends interchangeables.

Les langages de requête diffèrent. Les modèles de stockage diffèrent. Les fonctionnalités avancées diffèrent. Les dashboards, les alertes, les politiques de rétention et les modèles de coût diffèrent aussi.

Il serait donc faux de dire qu’on peut remplacer Dynatrace par Tempo ou l’inverse en changeant simplement une URL.

En revanche, **on peut éviter de réinstrumenter l’application pour chaque changement de destination**.

C’est déjà beaucoup.

Dans une architecture qui doit durer, je préfère que le code dise "voici une trace avec ces attributs" plutôt que "voici une trace destinée à tel produit".

Le premier est un contrat d’observabilité.

Le second est un choix d’implémentation qui fuit dans l’application.

## Pourquoi Alloy dans cette architecture

Pour la couche de collecte, j’ai proposé Grafana Alloy.

Nous aurions pu nous limiter à l’OpenTelemetry Collector upstream. Le choix d’Alloy venait surtout du contexte existant.

La plateforme devait faire cohabiter des signaux OpenTelemetry, des métriques Prometheus et plusieurs sources d’infrastructure. Alloy fournit des composants pour ces deux mondes et permet de construire des pipelines assez lisibles.

Il propose aussi des exporters directement utiles dans notre contexte, notamment pour Azure Monitor, Microsoft SQL Server et MongoDB.

Ce point a compté.

Une plateforme d’observabilité devient rapidement pénible lorsqu’elle accumule un exporter indépendant, un format de configuration et un mode de déploiement pour chaque technologie.

Avec Alloy, nous pouvions conserver un modèle commun et déployer les instances selon leur rôle : certaines proches des workloads, d’autres sous forme de gateway, avec des DaemonSet ou des Deployment selon le signal à collecter.

L’interface web est également utile pour comprendre l’état des composants et le cheminement de la configuration.

Ce n’est pas un argument pour déclarer Alloy meilleur dans l’absolu. Il correspondait simplement bien à **notre besoin de convergence entre OpenTelemetry, Prometheus et plusieurs sources techniques**.

## Une destination doit recevoir ce qui lui sert

Le multi-backend peut facilement devenir une excuse pour tout envoyer partout.

Ce n’était pas l’objectif.

Chaque copie supplémentaire augmente le coût réseau, le coût d’ingestion, le stockage, les risques liés aux données sensibles et la complexité du diagnostic.

Le principe que nous avons progressivement appliqué est plutôt :

> Une donnée n’est pas envoyée à une destination parce qu’elle existe. Elle y est envoyée parce qu’un usage le justifie.

Dynatrace reçoit ce qui est attendu dans la cible du client.

La stack Grafana conserve les signaux nécessaires à l’exploitation de la plateforme.

Splunk reçoit temporairement les logs encore requis par des usages historiques qui n’ont pas fini leur migration.

Cette distinction est importante parce que l’indépendance vis-à-vis d’un backend ne signifie pas qu’il faut dupliquer l’intégralité de la télémétrie dans quatre produits.

La réversibilité vient du contrat d’émission et de la capacité de routage, pas de la multiplication aveugle des copies.

## Le brownfield change la manière de migrer

Sur une plateforme neuve, j’aurais tendance à faire l’inverse.

Je partirais avec peu de signaux, peu d’attributs et des destinations clairement justifiées. J’ouvrirais ensuite progressivement ce qui est nécessaire.

Sur une application qui existe depuis quinze ans, cette approche peut être dangereuse.

Un champ qui semble inutile peut alimenter un dashboard oublié. Une source que personne ne revendique peut être interrogée chaque matin par une équipe. Un log trop verbeux peut être le seul moyen de diagnostiquer un traitement historique.

Il faut donc migrer en observant les usages avant de fermer les robinets.

C’est moins élégant sur le diagramme, mais beaucoup plus sûr en production.

La trajectoire devient :

1. standardiser l’émission ;
2. rendre les flux visibles ;
3. conserver temporairement les usages existants ;
4. migrer ce qui mérite de l’être ;
5. supprimer ce qui n’a plus de consommateur ;
6. resserrer progressivement les règles.

Le résultat cible peut être propre sans exiger que la première étape le soit déjà.

## L’indépendance n’est pas gratuite

Proposer OpenTelemetry n’était pas promettre une observabilité gratuite.

La couche de collecte doit être opérée. Les backends doivent être dimensionnés. La cardinalité doit être surveillée. Le sampling doit être pensé. Les données sensibles doivent être filtrées. Les règles doivent être maintenues.

Une solution SaaS peut être parfaitement rationnelle pour une équipe qui ne souhaite pas posséder cette compétence.

À l’inverse, lorsque plusieurs destinations coexistent déjà, que les volumes sont importants et que l’équipe plateforme veut garder la maîtrise de son instrumentation, la standardisation apporte une valeur différente : elle réduit le coût du prochain changement.

C’est ce coût futur qu’on oublie souvent dans les comparaisons.

On compare le prix d’ingestion du mois prochain, mais beaucoup moins le coût d’une réinstrumentation dans trois ans.

## Ce que j’ai réellement proposé

Au fond, je n’ai pas proposé "une stack Grafana".

J’ai proposé une séparation de responsabilités :

- les équipes applicatives décrivent ce que font leurs services avec un contrat d’instrumentation commun ;
- la plateforme collecte, filtre et route ;
- les backends stockent, analysent et visualisent ;
- le client conserve la décision sur les outils qu’il veut exploiter.

Cette séparation permet de satisfaire une migration vers Dynatrace sans rendre l’application dépendante de cette migration.

C’était la valeur recherchée.

La suite a été moins conceptuelle : il fallait maintenant appliquer ce modèle sur environ 200 services, dont certains vivent avec quinze ans d’histoire.

C’est là que le vrai travail a commencé.

## Suite

[2/4 : Comment j’ai accompagné l’instrumentation OpenTelemetry d’environ 200 services](/2026-09-22-opentelemetry-instrumenter-200-services)

## Sources officielles

- [OpenTelemetry : architecture du Collector](https://opentelemetry.io/docs/collector/architecture/)
- [OpenTelemetry Operator for Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/operator/)
- [Grafana Alloy : fonctionnement et pipelines multi-destinations](https://grafana.com/docs/alloy/latest/introduction/how-alloy-works/)
- [Grafana Alloy : composants Prometheus](https://grafana.com/docs/alloy/latest/reference/components/prometheus/)
- [Grafana Alloy : exporter Azure](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.azure/)
- [Grafana Alloy : exporter Microsoft SQL Server](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.mssql/)
- [Grafana Alloy : exporter MongoDB](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.mongodb/)
