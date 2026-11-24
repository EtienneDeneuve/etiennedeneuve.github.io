---
title: "FluxCD comme moteur de réconciliation"
description: "Séparer téléchargement, application, disponibilité et isolation."
pubDate: 2027-01-06T04:00:00.000Z
language: fr
translationKey: 2026-11-24-06-flux-reconciliation
contentType: architecture-decision
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
tags:
  - GitOps
  - Kubernetes
  - Platform Engineering
  - OCI
featured: false
draft: false
relatedProjects: []
relatedArticles: []
---

Ce que j'attends de Flux n'est pas un pipeline qui exécute des commandes dans l'ordre. Je veux des contrôleurs qui observent continuellement un état désiré et rendent leurs échecs visibles.

## Deux objets, deux responsabilités

OCIRepository récupère le contenu ; Kustomization le construit ou l'applique et vérifie sa disponibilité selon sa configuration. Le flux de dépendances doit rester explicite.

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: network
  namespace: flux-system
spec:
  interval: 10m
  sourceRef:
    kind: OCIRepository
    name: network
  path: ./
  prune: true
  wait: true
  timeout: 5m
  dependsOn:
    - name: gateway-crds
```

Cet exemple suppose une source et une Kustomization de CRDs existantes. Le champ prune nécessite une analyse de propriété : une disparition du paquet peut entraîner la suppression d'objets.

## La frontière multi-tenant

Une source accessible n'autorise pas à appliquer son contenu partout. Je limite les comptes de service des reconcilers, les références entre namespaces et les permissions des dépôts. Le bootstrap plateforme et les tenants n'ont pas le même niveau de privilèges.

Une condition Ready n'est pas un SLO utilisateur. Pour la promotion, je complète les conditions Kubernetes par des tests de service et, si nécessaire, du progressive delivery.

## Expérience à reproduire

Faire échouer la dépendance CRD, observer le blocage du contrôleur dépendant, corriger la source et vérifier la reprise. Tester ensuite une tentative d'application non autorisée avec un compte de service limité.

## Le DAG préparé pour le hub

Sur AKS, nous avons préparé une composition qui ordonne les opérateurs, la base PostgreSQL de Grafana, les backends VictoriaMetrics et Loki, Grafana HA puis Alloy en façade. Les sources OCI utilisent un tag dédié et des paramètres sont injectés avec postBuild.substitute. Le bootstrap vérifie le contexte Kubernetes, les prérequis cloud, le stockage et les secrets. Les tests fonctionnels de Grafana et de l'entrée OTLP restent nécessaires : la préparation des manifests ne prouve pas que la plateforme fonctionne en production.

## Substituer des données, pas inventer une architecture

Le postBuild de Flux doit rester une interface étroite. Un hostname, un nombre de replicas, une quantité CPU ou une référence de secret sont des entrées explicites. Je veux contrôler les variables obligatoires, activer la substitution stricte lorsque la version du contrôleur le permet, et refuser les variables non prévues par le contrat. La validation des types intervient sur le résultat rendu.

Pour une composition donnée, flux build kustomization permet de produire un résultat à inspecter avant réconciliation, avec les sources et substitutions correspondantes. Les entrées provenant de ConfigMaps ou Secrets doivent être représentées dans le test de manière sûre ; une simulation hors ligne ne reproduit pas nécessairement toutes les références du cluster. Les secrets réels ne doivent pas être versés dans les artefacts de CI.

Un dry-run serveur sur un cluster de validation compatible ajoute les contrôles de l'API et des admissions. Il ne garantit ni la disponibilité des contrôleurs ni les effets futurs des réconciliations. Une installation Kind avec vérifications fonctionnelles complète ce contrôle.

## Sources

- [Flux Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
- [Flux multi-tenancy](https://fluxcd.io/flux/installation/configuration/multitenancy/)
- [Lab Flagger](https://github.com/EtienneDeneuve/flagger-demo-kind)
