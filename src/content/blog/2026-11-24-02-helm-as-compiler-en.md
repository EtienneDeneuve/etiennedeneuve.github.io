---
title: "Why I prefer Helm as a compiler"
description: "Move chart rendering into CI without ignoring release contracts."
pubDate: 2026-12-09T04:00:00.000Z
language: en
translationKey: 2026-11-24-02-helm-as-compiler
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

I am not trying to remove Helm from Kubernetes. I want to avoid depending on its release engine to distribute every platform component.

A chart is a manifest generation program. Its inputs include values, Kubernetes capabilities and sometimes functions that consult the cluster. Versioning the chart does not identify its output by itself.

## What moves into CI

Pin the chart and dependencies, values and target Kubernetes version. Render the manifests, validate schemas and policies, then distribute the result.

```bash
helm template collector ./chart \
  --namespace monitoring \
  --kube-version 1.34.0 \
  --include-crds \
  --values values.yaml > rendered.yaml
```

The output still needs verification: some functions are nondeterministic and local rendering does not reproduce a real API lookup. Compare two renders and validate against a test cluster.

## What must not be hidden

Helm hooks do not automatically become properly orchestrated migrations when rendered YAML is applied. Inventory them, exclude them from the ordinary bundle and define ordering and idempotence. CRDs need an explicit lifecycle, particularly for schema changes and conversions.

Ownership also changes. Moving an existing release to a Kustomization requires an adoption plan, a controlled window and a check of deletion behavior. Blindly uninstalling Helm could remove active resources.

## When to keep Helm

A vendor operator with Helm-dependent upgrade procedures may justify retaining HelmRelease. Helm provides useful release history and remediation mechanisms. Support contracts and migration cost matter.

The criterion is whether I can identify and test what I distribute, not how many controllers I remove.

## Reproducible experiment

Compare a simple chart rendered in CI and a HelmRelease with identical inputs. Introduce a hook, a CRD and a generated value to see where equivalence breaks. Promote only cases with a validated contract.

## Our actual starting point

The AKS hub already consumes OCI manifests containing HelmRelease objects. Distribution and rendering are separate, but Helm remains active for some components. CI rendering is a direction, not an achievement I claim. Each migration needs testing and must preserve support contracts.

## Sources

- [Helm template](https://helm.sh/docs/helm/helm_template/)
- [Helm chart hooks](https://helm.sh/docs/topics/charts_hooks/)
- [Helm CRDs](https://helm.sh/docs/chart_best_practices/custom_resource_definitions/)
- [Flux HelmRelease](https://fluxcd.io/flux/components/helm/helmreleases/)
