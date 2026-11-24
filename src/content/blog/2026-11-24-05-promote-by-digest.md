---
title: "Construire une fois, promouvoir par digest"
description: "Dissocier la publication d’un paquet et son autorisation en production."
pubDate: 2026-12-30T04:00:00.000Z
language: fr
translationKey: 2026-11-24-05-promote-by-digest
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

Publier une nouvelle version d'infrastructure ne devrait pas signifier qu'elle arrive immédiatement en production. Je veux pouvoir décider de la promotion indépendamment de la construction.

## La composition est la décision

Un canal candidate peut servir à découvrir les nouvelles versions. Pour une promotion contrôlée, je préfère un commit qui remplace une référence explicite par le digest validé.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: OCIRepository
metadata:
  name: network
  namespace: flux-system
spec:
  interval: 5m
  url: oci://registry.example.com/platform/network
  ref:
    digest: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

Le digest est fictif dans cet exemple. En pratique il vient du registre. L'artefact de base reste identique ; les paramètres propres aux environnements restent visibles dans leur composition. Si je transforme le contenu après validation, je dois aussi valider cette transformation.

## Les critères de promotion

Les tests de compatibilité API, disponibilité, sécurité et comportement déterminent le passage entre environnements. Une validation en développement n'est pas une preuve de performance en production. Une promotion peut être refusée sans reconstruire le paquet.

Revenir au digest précédent ne restaure pas les données ni les effets externes. Pour les migrations, je veux un contrat de compatibilité avant la promotion.

## Expérience à reproduire

Publier deux paquets, promouvoir le second en développement, vérifier ses conditions et refuser sa promotion en production si le test échoue. Comparer ensuite les références et l'état observé.

## Isoler les lignes de distribution

Sur le hub AKS, un tag versionné dédié au nouveau hub a permis de publier des variantes HA sans remplacer le canal consommé par la plateforme existante. C'est une séparation de contrats, pas un changement d'environnement. Pour une cible durable, je préfère des chemins OCI distincts avec des tags SemVer indépendants, par exemple monitoring/grafana:1.2.0 et engineering/grafana:2.0.0. Un tag préfixé comme monitoring-1.2.0 reste une alternative. Je distingue la version upstream, celle du chart, celle du paquet et celle de la composition. Dans le cas réalisé, la sélection se fait par tag ; la promotion par digest est une amélioration proposée. Un tag versionné doit être protégé contre la réécriture : SemVer seul ne garantit pas l'immutabilité.

## Sources

- [Flux OCIRepository](https://fluxcd.io/flux/components/source/ocirepositories/)
- [Flux Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
