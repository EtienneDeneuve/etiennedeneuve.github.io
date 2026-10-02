---
title: "Pourquoi j’ai fini par écrire une petite app macOS pour provisionner mes postes"
description: "Le premier login mélange réseau, identité, privilèges root, Nix et reprise sur erreur. À un moment, continuer en shell était plus compliqué qu’écrire une petite app SwiftUI avec une vraie machine à états."
pubDate: 2026-10-05T07:30:00.000Z
language: fr
contentType: field-note
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - Swift
  - SwiftUI
  - macOS
  - Nix
  - XPC
  - Platform Engineering
featured: true
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-04-apple-business-entra-identite-workstation
  - 2026-10-06-versionner-postes-semver-nix
  - 2026-10-07-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 3/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/2026-10-03-provisioning-mac-pas-probleme-mdm). La suite : [je versionne mes postes de travail comme du logiciel](/2026-10-06-versionner-postes-semver-nix).

Au départ, je pensais pouvoir régler le premier login avec quelques scripts.

Après tout, il fallait « seulement » vérifier Nix, récupérer l’utilisateur, faire une authentification, construire une configuration et lancer nix-darwin.

Puis j’ai commencé à écrire la liste réelle :

~~~text
attendre une vraie session utilisateur
vérifier que Determinate est prêt
gérer une authentification Entra interactive
résoudre le profil
faire éventuellement un device flow GitHub
construire Nix sous le bon UID
activer en root
afficher la progression
reprendre après un crash
retry sans tout recommencer
rollback si l’activation casse
exporter des diagnostics
~~~

À ce stade, le script shell « simple » était en train de devenir une application sans interface, sans modèle d’état et avec des transitions implicites.

J’ai préféré assumer le problème.

J’ai écrit une petite app macOS.

## Swift et SwiftUI, volontairement sans exotisme

Le projet est très classique :

~~~text
Swift 6
SwiftUI
Xcode
XcodeGen
macOS 14+
~~~

Je n’avais aucune raison de mettre Electron ou une webview au milieu.

L’application est petite, profondément liée à macOS et doit dialoguer avec Keychain, MSAL, launchd et un helper privilégié.

SwiftUI est très bien placé pour ça.

Le projet reste buildable en ligne de commande avec `xcodebuild`. Xcode sert aux previews, au debug et à la signature, pas comme prérequis manuel au pipeline de release.

<!-- SCREENSHOT 1
Omnivya Setup.app sur l’écran de preflight "Checking this Mac before sign-in."
Idéalement sur un Mac fraîchement enrôlé avec le fond/branding final.
-->

## La vraie valeur de l’app est la machine à états

L’interface est presque secondaire.

Ce que je voulais surtout, c’était rendre le parcours explicite.

Dans la première version, les phases ressemblent à ça :

~~~text
idle
  -> preflight
  -> entraAuth
  -> roleResolved
  -> githubAuth?
  -> provisioning
  -> validating
  -> done
~~~

Chaque transition est testable.

Un échec devient un état.

Un retry a une sémantique.

Le provisioning garde des checkpoints sur disque pour ne pas recommencer aveuglément après une fermeture forcée ou un reboot.

Cette propriété vaut largement les quelques centaines de lignes de Swift supplémentaires.

Sans ça, une erreur au milieu d’un script finit souvent par produire deux questions pénibles :

1. qu’est-ce qui a réellement été appliqué ?
2. que puis-je relancer sans empirer la situation ?

## Je sépare l’interface du privilège root

L’app graphique ne tourne pas root.

Elle ne devrait pas.

J’ai donc séparé deux composants :

~~~mermaid
flowchart LR
    A[Omnivya Setup.app] -->|typed XPC| B[Workstation Helper]
    B --> C[Nix build]
    B --> D[nix-darwin activate]
    B --> E[rollback]
~~~

Le protocole du helper est volontairement borné.

Il expose des opérations du type :

~~~text
preflight
prepareDevice
buildConfiguration
activateConfiguration
validateConfiguration
rollback
status
~~~

Pas de commande générique « exécute ce shell ».

Je veux pouvoir raisonner sur ce que l’application non privilégiée a le droit de demander.

C’est aussi beaucoup plus simple à tester qu’un pseudo-shell root accessible par IPC.

## Construire en utilisateur, activer en root

Nix ajoute une subtilité intéressante.

Le build de la configuration dépend du contexte utilisateur, notamment pour Home Manager et le repository utilisé.

L’activation du système, elle, a besoin de privilèges.

Le découpage devient donc :

~~~text
user context
  -> resolve sources
  -> nix build

root helper
  -> set system profile
  -> activate
  -> validate
~~~

Je préfère cette séparation à une application qui lance `sudo` et espère qu’un prompt apparaisse au bon moment.

## GitHub est conditionnel

Pour un profil Direction ou Standard, GitHub n’a rien à faire dans le chemin critique.

Pour un profil Tech, mon implémentation actuelle peut lancer un Device Flow GitHub et cloner `mdm-setup` dans le workspace utilisateur.

L’écran est donc conditionnel.

~~~text
Tech
  -> Connect GitHub
  -> device code
  -> clone

Direction / Standard
  -> skip
~~~

<!-- SCREENSHOT 2
Écran GitHub de Omnivya Setup avec le device code visible.
Utiliser un code expiré ou généré pour la capture.
Ne jamais publier un token, cookie ou URL contenant un secret.
-->

Ce point évoluera probablement encore : je ne veux pas que GitHub devienne une dépendance de distribution pour les profils qui n’en ont pas besoin, et je travaille justement à pousser davantage de releases prébuildées.

Mais pour un développeur qui doit de toute façon travailler avec les repositories, le Device Flow reste une expérience bien meilleure qu’un PAT copié dans un terminal.

## Le premier login est un environnement hostile

Le pilote m’a rappelé une chose : « le desktop est affiché » ne signifie pas « tout est prêt ».

Le Setup Assistant peut se terminer alors que :

* Determinate n’a pas fini de devenir réellement opérationnel ;
* le réseau est connecté à un Wi-Fi derrière un captive portal ;
* un LaunchDaemon n’est pas encore chargé ;
* une dépendance attendue sur mon Mac de développement n’existe pas sur une installation propre.

Je durcis donc le preflight pour qu’il teste l’état dont j’ai réellement besoin, pas seulement l’existence d’un binaire.

~~~text
session utilisateur prête ?
helper chargé ?
daemon Nix sain ?
WAN réellement utilisable ?
puis seulement :
auth Entra
~~~

C’est exactement le genre de logique qui devient beaucoup plus saine dans une machine à états que dans une suite de `sleep 10`.

## Les logs font partie de l’UX

Je ne voulais pas une barre de progression qui reste à 43 % pendant cinq minutes sans explication.

L’application parse donc le flux de build Nix et affiche une progression, le package courant et une petite fenêtre de log.

En cas d’échec, l’utilisateur peut :

* retry ;
* exporter les diagnostics ;
* rollback dans les cas pertinents.

<!-- SCREENSHOT 3
Écran "Preparing your workstation" avec le pourcentage Nix et quelques lignes de log.
Choisir un moment où les noms de derivations sont parlants mais ne révèlent rien d’interne.
-->

<!-- SCREENSHOT 4
Écran d’erreur avec Try Again / Export Diagnostics / Rollback.
Idéalement une erreur volontaire sur un Mac de test, pas une capture contenant des tokens ou chemins personnels sensibles.
-->

Pour moi, c’est aussi du Platform Engineering.

Le golden path n’est pas seulement le chemin où tout marche. C’est également le chemin qui explique correctement ce qui s’est passé quand quelque chose ne marche pas.

## Une app minuscule, une frontière utile

Le résultat n’a rien d’un produit grand public.

C’est une petite application interne qui transforme un ensemble de dépendances système en parcours explicite.

Elle m’a surtout permis de poser des frontières :

~~~text
SwiftUI
  -> interaction

Entra
  -> identité

XPC helper
  -> privilèges

Nix
  -> état

Apple Business
  -> bootstrap
~~~

Et une fois ces frontières posées, une autre question est devenue évidente.

Pourquoi continuer à penser les mises à jour de workstation comme « récupérer la dernière version du repo » alors que tout le reste de mes systèmes utilise des releases ?

## Suite

[4/5 : Je versionne mes postes de travail comme du logiciel](/2026-10-06-versionner-postes-semver-nix)

## Sources officielles

- [Apple : SwiftUI](https://developer.apple.com/xcode/swiftui/)
- [Apple : XPC](https://developer.apple.com/documentation/xpc)
- [Microsoft Authentication Library](https://learn.microsoft.com/entra/msal/)
- [GitHub : OAuth device flow](https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
