---
title: "Build once, promote by digest"
description: "Separate package publication from production authorization."
pubDate: 2026-12-30T04:00:00.000Z
language: en
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

Publishing a new infrastructure version should not immediately put it into production. I want promotion decisions to remain independent of builds.

## Composition is the decision

A candidate channel can discover new versions. For controlled promotion, I prefer a commit replacing an explicit reference with the validated digest.

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

The digest is fictional. In practice it comes from the registry. The base artifact remains identical; environment-specific parameters stay visible in composition. Transformations after validation also require validation.

## Promotion criteria

API compatibility, readiness, security and behavior determine progression. Development validation is not evidence of production performance. A promotion can be rejected without rebuilding the package.

Reverting a digest does not restore data or external effects. Migrations need a compatibility contract before promotion.

## Reproducible experiment

Publish two packages, promote the second in development, verify conditions and reject production promotion if a test fails. Compare references and observed state.

## Isolating distribution lines

On the AKS hub, a dedicated versioned tag made it possible to publish HA variants without replacing the channel consumed by the existing platform. This separates contracts, not environments. For a durable design I prefer distinct OCI paths with independent SemVer tags, such as monitoring/grafana:1.2.0 and engineering/grafana:2.0.0. A prefixed tag such as monitoring-1.2.0 is an alternative. Upstream software, chart, package and composition versions are distinct. The implementation uses tag selection; promotion by digest is a proposed improvement. Protect version tags against overwrites: SemVer alone does not guarantee immutability.

## Evidence travels with the digest

Promotion must not rebuild the package. For a given digest I want the source SHA, resource inventory, validation results and tested composition. Production promotion also requires validation of the production delta. A successful development test does not automatically cover a hostname or storage class change.

An operator upgrade or backend topology change requires a new package and fresh checks. Changes limited to sizing or replicas belong to composition, subject to capacity and availability requirements.

## Sources

- [Flux OCIRepository](https://fluxcd.io/flux/components/source/ocirepositories/)
- [Flux Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
