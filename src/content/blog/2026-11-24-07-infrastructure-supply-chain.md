---
title: "Sécuriser la supply chain de l’infrastructure"
description: "Relier sources, artefacts, identités et politiques de vérification."
pubDate: 2027-01-13T04:00:00.000Z
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
draft: false
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

## Identités de publication et de consommation

Dans le cas GHCR, le poste de publication utilise une identité disposant de write:packages. Le cluster utilise un secret Docker distinct, limité à la lecture des packages, avec le provider generic de Flux. Les annotations source et revision relient le paquet à son SHA Git mais ne remplacent pas une attestation signée. Les secrets ne sont pas intégrés au bundle. La vérification cryptographique et les politiques d'admission sont des extensions de la chaîne, pas des contrôles dont je revendique ici le déploiement.

## Une attestation utile décrit les contrôles effectués

La chaîne de publication proposée associe au digest OCI le rapport de validation des fichiers réellement packagés : schémas incluant les CRDs, politiques, inventaire des images et tests d'intégration. Un rapport ne doit pas prétendre couvrir des tests non exécutés. Je distingue la preuve de construction du paquet, la preuve de validation des compositions rendues et les observations runtime.

Les politiques de sécurité doivent lire les manifests générés : containers privilégiés, montages hostPath, droits RBAC, images non épinglées, exposition réseau et secrets en clair. Une HelmRelease seule ne révèle pas toutes ces propriétés. Il faut rendre et inspecter ses ressources ou limiter explicitement la portée du rapport.

## SLSA : une propriété du processus de construction

SLSA (Supply-chain Levels for Software Artifacts) s'applique aussi à un paquet déclaratif. Je distingue les niveaux du Build Track v1.2 : L0 sans exigences, L1 avec provenance disponible, L2 avec provenance authentifiée produite par une plateforme de build hébergée, L3 avec une plateforme de build renforcée et une provenance protégée contre la falsification. L'objectif peut être L3, mais une signature Cosign ou une attestation GitHub ne suffit pas à démontrer ce niveau. Il faut évaluer les exigences du builder et de la provenance, notamment l'isolation entre builds et la protection des secrets de signature.

La provenance in-toto/SLSA décrit le sujet construit, les sources et le processus de build. Les résultats de validation constituent des attestations distinctes. Je veux pouvoir vérifier, pour un digest donné, quel workflow a construit le paquet, quel commit a été utilisé et quels contrôles ont effectivement réussi. Une signature établit une identité et une intégrité ; elle n'établit pas à elle seule la conformité du contenu.

### Vérification côté consommateur

Une politique Flux OCIRepository peut vérifier la signature Cosign et restreindre l'identité OIDC du signataire. Exemple fictif pour un workflow GitHub Actions autorisé :

```yaml
spec:
  url: oci://ghcr.io/example-org/infrastructure/grafana
  ref:
    tag: "1.4.0"
  verify:
    provider: cosign
    matchOIDCIdentity:
      - issuer: "^https://token.actions.githubusercontent.com$"
        subject: "^https://github.com/example-org/infrastructure/\\.github/workflows/publish\\.yml@refs/heads/main$"
```

En pratique je préfère fixer le digest après promotion. La vérification de signature Flux ne valide pas automatiquement le contenu des attestations SLSA ni les rapports de tests. Une gate de promotion doit contrôler le prédicat, le sujet, le builder attendu et les résultats requis. Kyverno peut compléter la chaîne en contrôlant les images runtime et les ressources admises. Pour un bucket brut, il faut une vérification explicite de l'inventaire signé et des fichiers, avant consommation ou via un mécanisme de confiance complémentaire ; Bucket n'est pas OCIRepository.

La rotation des clés, les identités compromises et le retrait de confiance doivent également être traités : conserver les preuves, revoir les politiques de confiance, empêcher la promotion d'artefacts compromis et vérifier les conséquences sur les réconciliations existantes.

- [SLSA v1.2 Build Track](https://slsa.dev/spec/v1.2/build-track)
- [in-toto Attestation Framework](https://github.com/in-toto/attestation)
- [Sigstore Cosign](https://docs.sigstore.dev/cosign/)

## Sources

- [Sigstore Cosign](https://docs.sigstore.dev/cosign/)
- [SLSA specification](https://slsa.dev/spec/)
- [Flux OCIRepository](https://fluxcd.io/flux/components/source/ocirepositories/)
