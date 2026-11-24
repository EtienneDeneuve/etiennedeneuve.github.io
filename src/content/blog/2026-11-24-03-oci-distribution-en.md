---
title: "OCI is not just for images"
description: "Understand OCI registry objects and guarantees."
pubDate: 2026-12-16T04:00:00.000Z
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
draft: false
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

## Packaging used in the field

Each component has a manifests directory, an OCIRepository, a Kustomization and optional upstream version annotations. A script invokes flux push artifact with the manifest path, Git SHA and distribution tag. GHCR holds the packages. Software, chart, infrastructure package and composition versions are distinct. A durable line may have its own repository, such as monitoring/grafana:1.2.0; a prefixed tag such as monitoring-1.2.0 is also possible. The digest identifies content.

## Publish what CI just checked

Separate the working directory from dist, which contains the files actually distributed. Once built, it becomes a read-only input to checks: Kubernetes and CRD schemas for supported versions, security policies, image references, resource inventory and diffs. Publishing does not regenerate anything.

After publishing, retrieve the artifact by digest, compare its file contents with the checked output and associate validation results with the OCI digest. A checksum of the directory or its files is not the OCI manifest digest: the identities serve different verification purposes.

If values still need injection, validate the base package first and each composition after substitution. Package validation is not evidence that every final configuration is valid.

## The registry is not the format

There are three separate choices: the payload, its envelope and the retrieval protocol. An OCI Image Layout stores descriptors and content-addressed blobs as files. ORAS can copy an artifact between a registry and a local layout. That layout can be archived in S3 or Azure Blob independently of the original registry.

A raw bucket does not implement OCI Distribution. To consume the layout through OCIRepository, restore it to a compatible registry or provide an adapter implementing that protocol. Alternatively, publish validated manifests directly to a versioned object-storage prefix and consume them through a Flux Bucket source (aws, azure or generic provider). This path does not consume an OCI manifest: Flux constructs its own source artifact from bucket files.

Distinguish file checksums, the OCI manifest digest and Flux's bucket revision identifier. Transport can change without changing the validated files, but these identifiers are not interchangeable.

- [OCI Image Layout](https://github.com/opencontainers/image-spec/blob/main/image-layout.md)
- [ORAS](https://oras.land/docs/)
- [Flux Bucket](https://fluxcd.io/flux/components/source/buckets/)


## Sources

- [OCI Image Specification](https://github.com/opencontainers/image-spec)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [Flux push artifact](https://fluxcd.io/flux/cmd/flux_push_artifact/)
