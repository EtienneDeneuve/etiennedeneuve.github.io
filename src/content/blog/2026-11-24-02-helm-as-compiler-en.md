---
title: "Helm, DRY and the hidden cost of infrastructure abstractions"
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

## The trouble starts with one line of YAML

A hostname should take seconds to find. Yet in platforms I have analysed, the final value can depend on a shared helper, namespace, release name and historical exceptions. Here is a fictional example, not customer code:

```yaml
host: {{ include "platform.endpoint" . }}
```

When a team needs to migrate a domain, that line reveals neither the current hostname nor the other applications affected by a helper change. Reviewers must reconstruct the rendering context. An exception for one service can change other releases. The review concerns a program even though the business decision concerned an address.

The attempt to remove hardcoded values has merely moved them into conditional branches. They are harder to discover.

## DRY is not a mandate to abstract everything that looks alike

DRY concerns duplicated knowledge. Two similar hostnames can belong to independent contracts. Generating both with one helper creates a dependency that did not previously exist. AHA (Avoid Hasty Abstractions) suggests waiting until the invariants are understood.

I prefer a few repeated explicit parameters to an abstraction whose consequences nobody can predict without running the engine. This does not mean copying every Deployment: structural invariants belong in a shared component, legitimate differences remain data.

For a monitoring hub, an HA variant should not emerge accidentally from a cluster-name condition. It is a distinct version or distribution line. At equivalent composition versions, environments consume the same package, with a small Flux substitution layer for addresses and capacity.

## Review the output

Rendering during reconciliation also changes what can be verified: CI may approve charts and values without checking the exact output consumed later. I want the rendered result available for review, validated and published without rebuilding it. Environment substitutions must then be rendered and validated separately. If the package still contains a HelmRelease, its rendering remains an additional step: checking the wrapper does not check its workloads.

Kustomize can reproduce the same mistakes when overlays become an implicit programming language. My criterion is whether the output can be read, compared and tested, regardless of engine.

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
