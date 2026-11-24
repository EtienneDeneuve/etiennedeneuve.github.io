---
title: "Rebuilding a platform from artifacts"
description: "Turn recovery into a measurable exercise rather than a GitOps promise."
pubDate: 2026-11-24T09:00:00.000Z
language: en
translationKey: 2026-11-24-08-platform-recovery
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

A well-organized Git repository is not a disaster recovery plan. I want to rebuild a platform on a new cluster and identify the dependencies that remain outside that process.

## Minimal bootstrap

Recovery requires a cluster, an identity able to retrieve artifacts, an available registry, composition references and a reconciliation engine. Registry and identity must not depend exclusively on the platform being restored.

```mermaid
flowchart TD
  A[Cluster and identity] --> B[Flux bootstrap]
  C[Registry and composition] --> B
  B --> D[CRDs and controllers]
  D --> E[Platform modules]
  F[Backups and external secrets] --> G[Data recovery]
  E --> G
  G --> H[Service validation]
```

## State is not an artifact

Volumes, databases, keys, DNS and external dependencies need their own procedures. Restoring database manifests does not restore data. Operator, schema and backup versions must be compatible.

Set recovery criteria before the exercise: time to usable service, freshness of restored data and functional checks. A Ready condition is insufficient.

## Reproducible experiment

On Kind, publish a composition containing a simple service and test persistent data. Back up that data outside the cluster. Destroy the disposable cluster, rebuild from digests, restore data and measure each phase. Also test an unavailable registry and a missing digest.

The result should be a report with measured durations, not an RTO promise.

## Sources

- [Flux bootstrap](https://fluxcd.io/flux/installation/bootstrap/)
- [Kind](https://kind.sigs.k8s.io/)
- [Kubernetes persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
