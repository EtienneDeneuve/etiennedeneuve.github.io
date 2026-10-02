---
title: "Pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM"
description: "Je voulais qu’un Mac neuf puisse passer de la boîte à un poste réellement prêt sans transformer le MDM en moteur de configuration. J’ai fini par séparer enrollment, identité, orchestration et état du poste."
pubDate: 2026-10-03T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - macOS
  - Apple Business
  - Nix
  - nix-darwin
  - Platform Engineering
featured: true
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-04-apple-business-entra-identite-workstation
  - 2026-10-05-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-06-versionner-postes-semver-nix
  - 2026-10-07-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 1/5. La suite : [Apple Business pour enrôler, Entra pour décider quel poste construire](/2026-10-04-apple-business-entra-identite-workstation).

Je voulais quelque chose d’assez banal : sortir un Mac de sa boîte, l’allumer, laisser l’utilisateur s’authentifier et obtenir quelques minutes plus tard un poste réellement prêt.

Pas un Mac « enrôlé ».

Pas un Mac avec trois applications installées et quinze scripts qui finiront peut-être par passer.

Un poste dont l’état est défini, reproductible et réappliquable.

C’est précisément là que j’ai arrêté de considérer le provisioning comme un simple problème MDM.

## Un MDM sait imposer. Ce n’est pas forcément un bon moteur de composition

On peut faire énormément de choses avec un MDM macOS.

Installer des applications, pousser des profils, exécuter des scripts, imposer des restrictions, configurer des services, gérer FileVault, les certificats et une bonne partie de la posture de sécurité.

La tentation est donc assez naturelle :

~~~text
MDM
  -> installe les applications
  -> pousse les préférences
  -> lance les scripts
  -> configure le shell
  -> installe les outils
  -> corrige les écarts
  -> relance encore quelques scripts
~~~

Ça fonctionne.

Puis le parc grandit, les rôles divergent, les scripts prennent des dépendances entre eux et une question finit par devenir pénible : **dans quel état exact est cette machine ?**

J’avais déjà une grande partie de la configuration de mes Mac dans Nix. Continuer à reproduire cette logique dans Apple Business n’aurait fait que créer une seconde source de vérité.

J’ai donc choisi une règle assez simple :

> **Le MDM impose. Nix compose.**

Apple Business doit être capable de prendre possession du Mac et de poser le socle nécessaire. Il n’a pas besoin de savoir quelle version de chaque CLI, quel shell, quel module Home Manager ou quel ensemble d’outils doit définir un poste technique.

<!-- SCREENSHOT 1
Apple Business > Blueprint du Mac de test montrant uniquement les briques bootstrap importantes, idéalement Determinate Nix puis Omnivya Workstation Bootstrap.
À masquer : serial number, URL complète du package, identifiants utilisateur.
-->

## Séparer les responsabilités m’a débloqué

Le modèle auquel je suis arrivé ressemble à ça :

~~~mermaid
flowchart TD
    A[Apple Business] -->|enrollment + bootstrap| B[macOS]
    C[Entra] -->|identity + App Role| D[Omnivya Setup]
    B --> D
    D -->|profile| E[Nix / nix-darwin]
    E --> F[Workstation]
~~~

Chaque composant a une responsabilité que je peux expliquer en une phrase.

**Apple Business** enrôle le Mac et installe le bootstrap.

**Entra** dit qui est devant le Mac et quel type de workstation cette personne est autorisée à recevoir.

**Omnivya Setup** orchestre le premier démarrage, les prérequis, l’authentification et les erreurs.

**Nix et nix-darwin** décrivent l’état du poste.

Ce découpage paraît presque évident une fois dessiné. Il ne l’était pas au départ.

## Le changement important : ne plus partir du hostname

Mon ancien modèle ressemblait beaucoup à ce qu’on retrouve dans les configurations de parc classiques :

~~~text
macbook-zine
  -> user zine
  -> role tech
  -> modules tech
~~~

Le hostname devenait implicitement l’identité de la machine et presque celle de la personne.

Ça tient tant qu’un utilisateur a exactement un Mac, que tous les appareils sont pré-déclarés et que le parc évolue lentement.

Je voulais l’inverse.

Dans le repository, j’ai donc séparé l’inventaire des identités, l’inventaire des devices et la fonction qui construit une workstation.

Le cœur ressemble conceptuellement à ça :

~~~nix
mkWorkstation {
  hostName = "...";
  userName = "...";
  fullName = "...";
  email = "...";
  org = "omnivya";
  role = "tech";
}
~~~

La composition finale reste :

~~~text
common
+ organisation
+ role
+ user overrides
+ device overrides
~~~

Mais un nouveau Mac n’a plus besoin d’une PR uniquement pour ajouter son hostname avant le premier démarrage.

C’est une petite différence de modèle qui change beaucoup de choses opérationnellement.

## Le bootstrap doit rester petit

J’ai également choisi de garder Determinate Nix séparé du package Omnivya.

Le Blueprint installe d’abord Determinate, puis un package Omnivya qui contient l’application d’onboarding, un helper privilégié, les LaunchAgents/LaunchDaemons nécessaires et éventuellement un snapshot de la configuration.

Le package ne fait pas un énorme `nix switch` dans son `postinstall`.

Il pose les briques.

Au premier vrai login graphique, l’application prend le relais.

~~~text
Setup Assistant
    |
    v
Determinate Nix
    |
    v
Omnivya Bootstrap.pkg
    |
    v
Premier login Aqua
    |
    v
Omnivya Setup.app
    |
    v
Nix / nix-darwin
~~~

J’y tiens parce qu’un installateur est un très mauvais endroit pour cacher dix minutes d’orchestration, une authentification interactive et des chemins de reprise.

## L’objectif n’est pas le « zero touch » absolu

Le terme zero-touch est pratique, mais je ne cherche pas à supprimer toute interaction humaine.

Je veux supprimer les interactions **sans valeur**.

Choisir soi-même « Tech » ou « Direction » est une interaction sans valeur : Entra connaît déjà cette information.

Copier un PAT GitHub est une interaction sans valeur.

Lancer manuellement cinq scripts dans le bon ordre est une interaction sans valeur.

En revanche, demander à l’utilisateur de s’authentifier avec son compte professionnel est parfaitement légitime. C’est même une frontière de sécurité utile.

Mon objectif ressemble donc davantage à ceci :

~~~text
Mac neuf
  -> enrollment automatique
  -> login utilisateur
  -> identité validée
  -> profil déterminé
  -> configuration appliquée
  -> poste prêt
~~~

Avec suffisamment d’état persistant pour reprendre si quelque chose casse au milieu.

## Ce que je garde volontairement dans Apple Business

Cette séparation ne signifie pas que je cherche à remplacer Apple Business.

Au contraire.

Il reste très bien placé pour les choses qui doivent être imposées depuis l’extérieur du poste : enrollment, posture de sécurité, configurations MDM, bootstrap initial, packages critiques.

Je ne veux simplement pas lui demander de devenir mon moteur de Platform Engineering pour macOS.

Le poste est pour moi une autre plateforme à composer.

Et à partir du moment où j’ai posé ça, la question suivante est devenue plus intéressante : **si le MDM ne choisit pas la workstation, qui la choisit ?**

La réponse est venue assez naturellement d’Entra.

## Suite

[2/5 : Apple Business pour enrôler, Entra pour décider quel poste construire](/2026-10-04-apple-business-entra-identite-workstation)

## Sources officielles

- [Apple Platform Deployment : Automated Device Enrollment](https://support.apple.com/guide/deployment/automated-device-enrollment-and-mdm-dep73069dd57/web)
- [Apple Business : Built-in device management](https://support.apple.com/guide/business/welcome/web)
- [Determinate Systems : Deploy Determinate with MDM](https://docs.determinate.systems/guides/mdm/)
- [nix-darwin](https://github.com/nix-darwin/nix-darwin)
