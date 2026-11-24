---
title: "OCI ne sert pas qu’aux images"
description: "Comprendre les objets et les garanties du registre OCI."
pubDate: 2026-12-16T04:00:00.000Z
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
draft: false
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

## Le packaging utilisé sur le terrain

Chaque composant possède un dossier manifests, une source OCIRepository, une Kustomization et éventuellement des annotations de version upstream. Un script appelle flux push artifact avec le chemin des manifests, le SHA Git et un tag de distribution. GHCR conserve les paquets. Je distingue les versions du logiciel, du chart, du paquet infrastructure et de la composition. Une ligne durable peut avoir son propre repository, par exemple monitoring/grafana:1.2.0 ; un tag préfixé comme monitoring-1.2.0 est aussi possible. Le digest reste l'identité du contenu.

## Publier ce que la CI vient de contrôler

Je sépare le répertoire de travail du répertoire dist. Le second contient les fichiers effectivement distribués. Une fois construit, il devient une entrée en lecture seule pour les contrôles : schémas Kubernetes et CRDs correspondant aux versions supportées, politiques de sécurité, références d'images, inventaire et diff des ressources. Le push ne relance pas la génération.

Après publication, je veux récupérer l'artefact par son digest, vérifier le contenu des fichiers contre celui qui a passé les contrôles et associer les résultats au digest OCI. Une somme de contrôle du répertoire ou de ses fichiers n'est pas le digest du manifeste OCI : les deux identités servent à des vérifications différentes.

Si des valeurs restent à injecter, le paquet de base est validé une première fois puis chaque composition est validée après substitution. Une validation du paquet ne doit pas être présentée comme une validation de toutes les configurations finales.

## Le registre n'est pas le format

Il existe trois choix différents : le contenu à distribuer, son enveloppe et le protocole qui permet de le récupérer. Un OCI Image Layout conserve les descripteurs et les blobs dans des fichiers adressés par leur contenu. ORAS permet de copier un artefact entre un registre et un layout local. Ce layout peut ensuite être archivé dans S3 ou Azure Blob, sans dépendre du registre d'origine.

Un bucket brut ne parle toutefois pas le protocole OCI Distribution. Pour consommer le layout avec OCIRepository, il faut le restaurer dans un registre compatible ou disposer d'un adaptateur qui expose ce protocole. Une autre option est de publier directement les manifests validés dans un préfixe versionné du stockage objet et de les consommer avec une source Flux Bucket (provider aws, azure ou generic). Ce second chemin ne consomme pas un manifeste OCI : Flux assemble sa propre source à partir des fichiers du bucket.

Je sépare donc la somme de contrôle des fichiers, le digest du manifeste OCI et l'identifiant de révision produit par Flux pour le bucket. Le transport peut changer sans changer les fichiers validés, mais ces identifiants ne sont pas interchangeables.

- [OCI Image Layout](https://github.com/opencontainers/image-spec/blob/main/image-layout.md)
- [ORAS](https://oras.land/docs/)
- [Flux Bucket](https://fluxcd.io/flux/components/source/buckets/)


## Sources

- [OCI Image Specification](https://github.com/opencontainers/image-spec)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [Flux push artifact](https://fluxcd.io/flux/cmd/flux_push_artifact/)
