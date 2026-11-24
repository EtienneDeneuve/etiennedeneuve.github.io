---
title: "Build once, promote by digest"
description: "Separate package publication from production authorization."
pubDate: 2026-11-24T09:00:00.000Z
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
draft: true
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

## Sources

- [Flux OCIRepository](https://fluxcd.io/flux/components/source/ocirepositories/)
- [Flux Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
