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

Je voulais un truc assez simple : un Mac sort de sa boîte, l’utilisateur se connecte, et quelques minutes plus tard il a un poste prêt.

Pas « enrôlé ». Pas « presque prêt, il reste juste trois scripts à lancer et deux applications à installer ». Prêt.

Dit comme ça, ça ressemble à un sujet MDM. C’est d’ailleurs comme ça que je l’avais abordé au début. On pousse des packages, quelques profils, des scripts, on remet une couche pour les exceptions, puis on finit avec un système qui marche très bien tant qu’on ne cherche pas trop à comprendre dans quel état exact se trouve la machine.

Le problème n’est pas que le MDM ne sait pas faire tout ça. C’est presque l’inverse : il sait suffisamment de choses pour qu’on soit tenté de tout lui confier.

Et c’est là que ça commence à me gêner.

## Le MDM n’avait pas besoin de devenir ma source de vérité

J’avais déjà une bonne partie de mes Mac gérée avec Nix et nix-darwin. Le shell, les outils, Home Manager, les rôles, les variantes par utilisateur : tout ça existait déjà dans un modèle déclaratif.

Recréer la même logique dans Apple Business aurait donné deux sources de vérité.

D’un côté, Nix dit ce que doit contenir un poste. De l’autre, le MDM pousse progressivement des morceaux du même état avec ses propres règles, ses propres dépendances et son propre historique.

Ça finit rarement bien.

J’ai donc gardé une règle très simple : **le MDM impose, Nix compose**.

Apple Business reste responsable de ce qui doit être imposé de l’extérieur : l’enrôlement, le bootstrap, les configurations de sécurité, les packages indispensables. En revanche, je ne veux pas qu’il sache comment assembler un poste Tech, Direction ou Standard jusque dans le détail des outils utilisateur.

<!-- SCREENSHOT 1
Apple Business > Blueprint du Mac de test montrant surtout Determinate Nix puis Omnivya Workstation Bootstrap.
À masquer : serial number, URL complète du package, identifiants utilisateur.
-->

Ça peut paraître comme une nuance de vocabulaire. En pratique, ça change complètement la manière de concevoir le provisioning.

## Le hostname était devenu une mauvaise abstraction

L’ancien modèle était très classique : j’avais des machines connues dans l’inventaire et une configuration par hostname.

Ça ressemble à ça :

~~~text
macbook-zine
  -> utilisateur zine
  -> rôle tech
  -> configuration tech
~~~

Pour un petit parc, ce n’est pas absurde du tout. Le problème apparaît au moment où le hostname devient implicitement la clé qui relie la personne, la machine et son rôle.

Un utilisateur peut avoir deux Macs. Un Mac peut être remplacé. Une personne peut changer de rôle. Et surtout, je ne voulais pas devoir ouvrir une PR juste pour déclarer le hostname d’une machine avant qu’elle soit capable de se provisionner.

J’ai donc séparé les trois notions.

Le repository contient désormais les identités connues, les devices connus, et une fonction qui construit une workstation à partir de paramètres.

En gros :

~~~nix
mkWorkstation {
  hostName = "...";
  userName = "...";
  email = "...";
  org = "omnivya";
  role = "tech";
}
~~~

Le résultat reste composé de modules communs, du rôle, de l’organisation, des éventuels overrides utilisateur et de quelques particularités device. Mais le premier boot n’a plus besoin que la machine existe déjà dans l’inventaire.

C’est beaucoup plus proche de ce que je voulais : l’inventaire décrit le parc connu, il ne bloque pas l’arrivée d’un nouveau poste.

## Le découpage a fini par devenir assez évident

Une fois ce problème posé correctement, les responsabilités se sont séparées presque toutes seules.

~~~mermaid
flowchart TD
    A[Apple Business] -->|enrollment + bootstrap| B[macOS]
    C[Entra] -->|identity + role| D[Omnivya Setup]
    B --> D
    D --> E[Nix / nix-darwin]
    E --> F[Workstation]
~~~

Apple Business prend possession de la machine et pousse le socle.

Entra répond à la question « qui est devant ce Mac, et à quel type de poste cette personne a droit ? ».

Une petite application macOS orchestre le premier login.

Nix construit et applique l’état du poste.

Je préfère largement ce découpage à un gros workflow MDM qui essaie de tout savoir sur tout.

Il y a aussi un avantage très concret : quand quelque chose casse, on sait plus facilement où regarder. Si le package n’est pas arrivé, je regarde Apple Business. Si l’identité n’est pas bonne, je regarde Entra. Si la machine a reçu le bon profil mais pas les bons outils, je regarde Nix.

Ça paraît évident après coup. Sur un écran MDM avec vingt étapes qui s’enchaînent, ça l’est beaucoup moins.

## Determinate reste séparé

Autre choix que j’ai gardé assez strict : Determinate Nix est installé séparément du package Omnivya.

Je pourrais techniquement essayer d’embarquer plus de choses dans un énorme bootstrap. Je n’y vois pas beaucoup d’intérêt.

Determinate gère son installation, son daemon et son cycle de vie. Mon package installe l’application d’onboarding, le helper privilégié et ce qu’il faut pour démarrer le parcours au premier login.

Le `postinstall` ne lance pas un gros `nix switch` caché en arrière-plan.

Je veux que l’installateur reste un installateur.

Le provisioning lourd arrive ensuite, dans une vraie session utilisateur, avec une interface, de l’état persistant, du retry et des diagnostics.

C’est moins « magique », mais beaucoup plus contrôlable.

## Je ne cherche pas vraiment le zero-touch

On utilise facilement ce terme pour ce genre de sujet, mais ce n’est pas exactement mon objectif.

Je ne cherche pas à supprimer toute interaction humaine. Je cherche à supprimer les interactions inutiles.

Choisir soi-même son rôle dans une liste ? Inutile.

Copier un PAT GitHub ? Inutile.

Ouvrir un terminal pour lancer trois commandes dans le bon ordre ? Inutile.

S’authentifier avec son compte professionnel, en revanche, a du sens. C’est même une étape que je préfère garder explicite : elle marque clairement la frontière entre une machine enrôlée et une identité autorisée à recevoir un environnement donné.

Le parcours que je vise est donc assez simple : le Mac s’enrôle, l’utilisateur se connecte, son identité détermine son profil, puis la configuration s’applique.

Le point important est que chaque étape sache ce qu’elle fait et pourquoi elle le fait.

## Apple Business reste très important dans le modèle

Ce n’est pas une série « pourquoi j’ai remplacé mon MDM par Nix ».

Je n’ai justement aucune envie de réécrire un MDM.

Apple Business fait très bien la partie enrollment et contrôle du device. Je veux simplement éviter qu’il devienne aussi mon moteur de composition, mon inventaire applicatif, mon gestionnaire de shell, mon orchestrateur Nix et mon mécanisme de mise à jour.

Le poste de travail est une plateforme. J’ai donc préféré lui appliquer les mêmes principes que ceux que j’utilise ailleurs : séparation des responsabilités, état déclaratif, identité explicite, versionnement et rollback.

La question suivante était alors assez naturelle : si Apple Business ne choisit plus la workstation, qui la choisit ?

Dans mon cas, la réponse était déjà dans Entra.

## Suite

[2/5 : Apple Business pour enrôler, Entra pour décider quel poste construire](/2026-10-04-apple-business-entra-identite-workstation)

## Sources officielles

- [Apple Platform Deployment : Automated Device Enrollment](https://support.apple.com/guide/deployment/automated-device-enrollment-and-mdm-dep73069dd57/web)
- [Apple Business](https://support.apple.com/guide/business/welcome/web)
- [Determinate Systems : Deploy Determinate with MDM](https://docs.determinate.systems/guides/mdm/)
- [nix-darwin](https://github.com/nix-darwin/nix-darwin)
