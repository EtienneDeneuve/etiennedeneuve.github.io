---
title: "OCI ne sert pas qu’aux images"
description: "Comprendre les objets et les garanties du registre OCI."
pubDate: 2026-11-24T09:00:00.000Z
language: fr
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

Le registre que j'utilise pour distribuer mes images peut aussi transporter les manifests qui décrivent mon infrastructure. Ce qui m'intéresse ici n'est pas le format conteneur, mais le protocole de distribution.

## Le contenu et son identité

Un manifeste OCI référence des blobs par digest et type de média. Un tag est un nom qui peut être déplacé. Un digest identifie le contenu adressé. Je conserve les deux : une version lisible pour les équipes et un digest pour la décision technique.

Flux sait publier et consommer des artefacts OCI contenant des fichiers de configuration. Exemple avec un registre de test accessible et une authentification déjà configurée :

```bash
flux push artifact oci://registry.example.com/platform/network:1.0.0 \
  --path=./dist \
  --source="$(git config --get remote.origin.url)" \
  --revision="$(git rev-parse HEAD)"
```

Je capture le digest renvoyé et le consigne dans la composition. Le tag n'est pas une preuve d'immutabilité : le registre doit aussi conserver les blobs et protéger les références nécessaires.

## Les limites

Une signature ne prouve pas qu'un paquet est exempt de vulnérabilités. Un digest n'assure pas sa disponibilité. Une politique de rétention peut casser une reconstruction pourtant bien versionnée. Le registre devient une dépendance opérationnelle à traiter comme telle.

## Expérience à reproduire

Publier deux versions sous un tag de test, conserver le premier digest et vérifier qu'une référence par digest récupère toujours le premier contenu tant que le registre le conserve. Tester ensuite la politique de rétention dans un registre jetable.

## Sources

- [OCI Image Specification](https://github.com/opencontainers/image-spec)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [Flux push artifact](https://fluxcd.io/flux/cmd/flux_push_artifact/)
