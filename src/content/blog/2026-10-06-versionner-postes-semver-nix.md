---
title: "Je versionne mes postes de travail comme du logiciel"
description: "Un poste ne devrait pas être simplement « sur la dernière config Git ». J’ai commencé à traiter la workstation comme un artefact versionné : SemVer, provenance, rollback et bientôt profils Nix prébuildés."
pubDate: 2026-10-06T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: software-supply-chain
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - Nix
  - SemVer
  - macOS
  - Azure Blob
  - Software Supply Chain
featured: true
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-04-apple-business-entra-identite-workstation
  - 2026-10-05-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-07-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 4/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/2026-10-03-provisioning-mac-pas-probleme-mdm). La suite : [ce qui casse quand on essaie vraiment](/2026-10-07-ce-qui-casse-provisioning-macos).

Il y a un truc qui me gêne depuis longtemps dans la gestion des postes.

Pour un service en production, personne n’accepterait sérieusement :

> Il tourne sur la dernière version de main que la machine a réussi à récupérer.

On veut une version, un artefact, une provenance et un moyen de revenir en arrière.

Pour un laptop, on accepte pourtant assez facilement :

~~~text
git pull
script update
latest
quelques packages
et normalement c’est bon
~~~

Je voulais arrêter ça aussi.

## J’ai commencé par versionner le bootstrap

Le package macOS qui installe Omnivya Setup possède déjà sa propre version.

Le pipeline produit quelque chose du genre :

~~~text
OmnivyaWorkstationBootstrap-0.1.19-<commit>.pkg
~~~

et embarque un petit fichier de provenance avec :

~~~json
{
  "packageVersion": "0.1.19",
  "appVersion": "0.1.19",
  "mdmSetupCommit": "...",
  "buildDate": "...",
  "snapshotEmbedded": true
}
~~~

Ce n’est pas révolutionnaire.

Mais ça répond déjà à une question essentielle pendant un incident :

**qu’est-ce qui a réellement été installé sur ce Mac ?**

<!-- SCREENSHOT 1
Terminal ou Finder montrant le nom versionné du PKG + un extrait propre de provenance.json.
Masquer les URLs SAS éventuelles et tout identifiant personnel.
-->

## SemVer plutôt que « stable » comme seule notion

Je veux utiliser SemVer pour la configuration workstation elle-même.

Par exemple :

~~~text
2.6.1
2.7.0-pilot.1
2.7.0-rc.1
2.7.0
3.0.0
~~~

La sémantique que je retiens est assez classique :

**MAJOR** pour une migration incompatible ou une évolution qui demande un traitement spécifique.

**MINOR** pour une nouvelle capacité compatible.

**PATCH** pour une correction ou une mise à jour sans changement de modèle.

Un channel `stable` ou `pilot` reste utile, mais il répond à une autre question.

~~~text
SemVer  -> quelle release ?
channel -> qui peut la voir ?
~~~

Je préfère cette séparation à une branche `stable` qui change de contenu sans identité suffisamment forte.

## Le SHA reste la vérité technique

SemVer est très pratique pour les humains.

Pour la provenance, je garde également le commit exact.

~~~text
version: 2.7.0
tag: v2.7.0
source commit: 8a71cb2...
~~~

Une release devient donc un couple lisible et traçable.

C’est aussi utile pour afficher dans l’application :

~~~text
Workstation configuration

Current: 2.6.1
Available: 2.7.0
~~~

sans perdre la possibilité de remonter au contenu exact.

## Aujourd’hui, le pilote build encore localement

Je préfère être précis sur l’état actuel.

Mon pilote sait construire une workstation depuis le snapshot embarqué dans le Bootstrap.pkg. Pour les profils Tech, l’app peut aussi authentifier GitHub, cloner `mdm-setup` et préférer ce checkout pour la construction.

Ça m’a permis de valider très vite toute la chaîne.

Mais ce n’est pas le modèle de distribution que je veux garder à terme.

GitHub est une excellente source de développement.

Je ne veux pas qu’il devienne une dépendance runtime de tous mes utilisateurs.

Une personne en Direction n’a aucune raison d’avoir un compte GitHub juste pour recevoir sa configuration de poste.

## La prochaine étape : prébuilder les profils

La cible que je mets en place est donc différente.

À chaque release :

~~~mermaid
flowchart TD
    A[Git tag v2.7.0] --> B[Release builder]
    B --> C[Standard]
    B --> D[Direction]
    B --> E[Tech]
    C --> F[Signed artifacts]
    D --> F
    E --> F
    F --> G[Private object storage]
    G --> H[Omnivya Setup]
    H --> I[Nix store]
~~~

Le repository reste la source.

Le poste consomme un artefact.

Pour commencer, je peux exporter une closure Nix complète par profil. Si les volumes deviennent trop importants, le même stockage peut évoluer vers un vrai binary cache Nix, avec déduplication des store paths.

Je préfère commencer simple et mesurer.

## Entra devant le stockage

Le profile registry est privé.

L’application vient déjà de faire une authentification Entra, donc le stockage peut être lu avec cette identité plutôt qu’avec une clé statique embarquée dans l’app.

Le modèle devient :

~~~text
Entra
  -> qui est l’utilisateur ?
  -> quel profile ID est autorisé ?

Registry
  -> quelle version correspond à ce profile/channel ?

Artifact
  -> quel contenu exact installer ?
~~~

Je veux également signer les manifests.

L’authentification au stockage dit **qui peut lire**.

La signature dit **ce que le poste accepte d’appliquer**.

Ce n’est pas la même propriété de sécurité.

## Un manifest plutôt qu’une URL magique

Je veux que l’application résolve un manifest explicite, pas un objet nommé `latest.pkg` ou `latest.tar.zst`.

Conceptuellement :

~~~json
{
  "schemaVersion": 1,
  "profile": "tech",
  "version": "2.7.0",
  "sourceCommit": "...",
  "requires": {
    "minBootstrapVersion": "1.2.0",
    "minMacOS": "15.0"
  },
  "artifact": {
    "sha256": "...",
    "compressedBytes": 123456789,
    "closureBytes": 2345678901
  }
}
~~~

Le détail exact pourra évoluer.

Ce qui compte est que l’app puisse répondre **avant** d’installer :

* est-ce une version autorisée ?
* suis-je compatible ?
* ai-je assez d’espace disque ?
* puis-je revenir à la version précédente ?

## Le rollback fait partie du contrat

Une workstation versionnée sans stratégie de rollback reste une bonne intention.

Je garde donc au minimum :

~~~text
current
previous-known-good
~~~

Après une mise à jour réussie :

~~~text
nouvelle version       -> current
ancienne version       -> previous-known-good
ancienne previous      -> GC eligible
~~~

Cette règle a également une conséquence pratique : le garbage collection Nix ne peut pas être un cron aveugle.

Sur un SSD de 512 Go, accumuler toutes les closures prébuildées finirait vite par être absurde.

L’application doit savoir ce qu’elle protège avant de nettoyer le reste.

## Ce que j’essaie réellement de construire

Je ne cherche pas à inventer un nouveau MDM.

Je cherche à appliquer à mes workstations des propriétés que je considère déjà normales ailleurs :

~~~text
source contrôlée
release identifiée
artefact immuable
provenance
compatibilité
déploiement
validation
rollback
~~~

Ça ressemble beaucoup plus à une software supply chain qu’à une collection de scripts de poste.

Et plus j’avance, plus cette analogie me paraît utile.

Le dernier article est justement celui où la théorie rencontre un Mac fraîchement effacé, `appstored`, Homebrew, des claims Entra incomplets et un package qui ne contient pas ce qu’Apple attend.

## Suite

[5/5 : Ce qui casse quand on essaie vraiment de provisionner un Mac de zéro](/2026-10-07-ce-qui-casse-provisioning-macos)

## Sources officielles

- [Semantic Versioning](https://semver.org/)
- [Nix manual : store](https://nix.dev/manual/nix/latest/store/)
- [NixOS Wiki : Binary Cache](https://wiki.nixos.org/wiki/Binary_Cache)
- [Microsoft : Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/azure/storage/blobs/authorize-access-azure-active-directory)
