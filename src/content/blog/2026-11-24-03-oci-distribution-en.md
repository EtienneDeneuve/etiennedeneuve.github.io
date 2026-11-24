---
title: "OCI is not just for images"
description: "Understand OCI registry objects and guarantees."
pubDate: 2026-11-24T09:00:00.000Z
language: en
translationKey: 2026-11-24-03-oci-distribution
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

The registry I use to distribute images can also carry the manifests describing my infrastructure. The interesting part is the distribution protocol, not the container format.

## Content and identity

An OCI manifest references blobs by digest and media type. A tag is a movable name. A digest identifies addressed content. I keep both: a readable version for teams and a digest for technical decisions.

Flux can publish and consume OCI artifacts containing configuration files. With an accessible test registry and authentication already configured:

```bash
flux push artifact oci://registry.example.com/platform/network:1.0.0 \
  --path=./dist \
  --source="$(git config --get remote.origin.url)" \
  --revision="$(git rev-parse HEAD)"
```

Capture the returned digest and record it in the composition. A tag is not evidence of immutability: the registry must retain blobs and protect the required references.

## Boundaries

A signature does not prove a package is free of vulnerabilities. A digest does not ensure availability. Retention policy can break an otherwise well-versioned recovery. Treat the registry as an operational dependency.

## Reproducible experiment

Publish two versions under a test tag, retain the first digest and verify that referencing it still retrieves the first content while the registry retains it. Then test retention policy in a disposable registry.

## Sources

- [OCI Image Specification](https://github.com/opencontainers/image-spec)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [Flux push artifact](https://fluxcd.io/flux/cmd/flux_push_artifact/)
