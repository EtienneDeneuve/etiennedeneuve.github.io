---
title: "Sécuriser la supply chain de l’infrastructure"
description: "Relier sources, artefacts, identités et politiques de vérification."
pubDate: 2026-11-24T09:00:00.000Z
language: fr
translationKey: 2026-11-24-07-infrastructure-supply-chain
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

Signer un paquet d'infrastructure ne suffit pas. Je veux savoir qui l'a construit, à partir de quelles entrées, et pourquoi le cluster accepte de le consommer.

## Identité et provenance

La CI publie avec une identité dédiée et des permissions limitées. Lorsque le registre le permet, une identité fédérée évite les secrets persistants. La provenance relie le digest aux sources et au processus de construction. Une signature associe le contenu à une identité de confiance.

```mermaid
flowchart LR
  A[Source reviewed] --> B[CI identity]
  B --> C[Artifact digest]
  B --> D[Provenance and signature]
  C --> E[Verification policy]
  D --> E
  E --> F[Reconciliation]
```

La politique doit vérifier davantage que la présence d'une signature : identité attendue, émetteur, dépôt et workflow autorisés selon le modèle retenu. La vérification du bundle et celle des images référencées sont deux contrôles différents.

## Ne pas confondre preuve et assurance

Un SBOM peut inventorier les dépendances lorsque le format et le périmètre le permettent. Il ne constitue pas une preuve d'absence de vulnérabilité. Une attestation SLSA ne donne pas automatiquement un niveau SLSA. Les manifests doivent aussi être contrôlés pour les privilèges, les secrets et les références d'images.

## Expérience à reproduire

Signer un paquet avec une identité de test autorisée, vérifier son acceptation, puis publier un paquet non signé ou signé par une autre identité. Vérifier le refus et la visibilité de l'erreur. Tester séparément une image non conforme référencée par un bundle conforme.

## Sources

- [Sigstore Cosign](https://docs.sigstore.dev/cosign/)
- [SLSA specification](https://slsa.dev/spec/)
- [Flux OCIRepository](https://fluxcd.io/flux/components/source/ocirepositories/)
