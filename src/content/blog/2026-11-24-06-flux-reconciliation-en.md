---
title: "FluxCD as a reconciliation engine"
description: "Separate retrieval, application, readiness and isolation."
pubDate: 2026-11-24T09:00:00.000Z
language: en
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
draft: true
relatedProjects: []
relatedArticles: []
---

I do not expect Flux to be a pipeline running commands in sequence. I want controllers that continually observe desired state and expose failures.

## Two objects, two responsibilities

OCIRepository retrieves content; Kustomization builds or applies it and checks readiness according to its configuration. Dependencies must remain explicit.

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

This assumes an existing source and CRD Kustomization. Pruning requires ownership analysis: removing content from a package can delete objects.

## The multi-tenant boundary

Access to a source does not authorize applying its content everywhere. Restrict reconciler service accounts, cross-namespace references and repository permissions. Platform bootstrap and tenants have different privilege levels.

A Ready condition is not a user SLO. Supplement Kubernetes conditions with service tests and progressive delivery where needed.

## Reproducible experiment

Break the CRD dependency, observe the dependent controller being blocked, fix the source and verify recovery. Then test an unauthorized apply using a restricted service account.

## Sources

- [Flux Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
- [Flux multi-tenancy](https://fluxcd.io/flux/installation/configuration/multitenancy/)
- [Flagger lab](https://github.com/EtienneDeneuve/flagger-demo-kind)
