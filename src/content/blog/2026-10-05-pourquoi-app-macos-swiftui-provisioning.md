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

Au début, je pensais vraiment pouvoir gérer le premier login avec quelques scripts.

Sur le papier, il fallait vérifier que Nix était là, récupérer l’utilisateur, faire une authentification, construire la config, lancer nix-darwin et terminé.

Évidemment, la vraie liste était un peu moins jolie.

Il fallait attendre une vraie session graphique, savoir si Determinate était réellement prêt, gérer Entra, éventuellement GitHub, construire Nix dans le bon contexte utilisateur, activer en root, reprendre après un crash, expliquer ce qui se passe à l’écran et surtout éviter qu’un retry relance n’importe quoi dans n’importe quel état.

À ce moment-là, continuer en shell aurait juste produit une application… sans interface et sans vraie machine à états.

J’ai donc arrêté de lutter contre le problème et j’ai écrit une petite app macOS.

## SwiftUI était le choix le plus banal

Le projet est volontairement classique : Swift 6, SwiftUI, Xcode et XcodeGen.

Je n’avais aucune envie de rajouter Electron ou une webview pour une application qui doit discuter avec macOS, Keychain, MSAL, launchd et un helper privilégié.

L’app est petite et très liée au système. SwiftUI est largement suffisant.

Je garde aussi le build utilisable en ligne de commande avec `xcodebuild`. Xcode sert quand j’en ai besoin pour les previews, le debug ou la signature, mais je ne veux pas que la release dépende d’une série de clics dans l’IDE.

<!-- SCREENSHOT 1
Omnivya Setup.app sur l’écran de preflight "Checking this Mac before sign-in."
Idéalement sur un Mac fraîchement enrôlé avec le branding final.
-->

## Le vrai intérêt n’est pas l’interface

L’interface pourrait être moche et le modèle resterait intéressant.

Ce qui m’intéresse surtout, c’est que le parcours soit enfin explicite.

Il y a un état de preflight, un état d’authentification Entra, un profil résolu, éventuellement une étape GitHub, puis le provisioning, la validation et la fin.

Un échec est lui aussi un état.

Ça paraît trivial, mais ça change beaucoup de choses. Quand le Mac redémarre au milieu, quand l’app est fermée de force ou quand une activation Nix échoue, je peux décider précisément ce qui est rejouable et ce qui ne l’est pas.

Avant, ce genre de logique finit vite dans des fichiers marqueurs, quelques `if`, un `sleep 10` et beaucoup d’espoir.

Là, les transitions sont testées et le run garde des checkpoints.

## Je ne voulais pas faire tourner l’UI en root

Autre point assez vite évident : l’application graphique ne doit pas avoir les privilèges nécessaires pour modifier le système.

J’ai donc séparé l’app et un helper privilégié.

~~~mermaid
flowchart LR
    A[Omnivya Setup.app] -->|XPC| B[Workstation Helper]
    B --> C[Nix build]
    B --> D[nix-darwin activate]
    B --> E[rollback]
~~~

Je ne voulais surtout pas d’un endpoint du genre `run(command)`.

Le helper expose un petit protocole avec des opérations connues : preflight, préparation du device, build, activation, validation, rollback, status.

Ça rend la frontière beaucoup plus claire. L’app demande une opération. Le helper décide comment la réaliser avec les privilèges nécessaires.

C’est beaucoup plus sain qu’un shell root télécommandé depuis l’UI.

## Le contexte utilisateur compte vraiment avec Nix

Le build et l’activation ne vivent pas exactement au même endroit.

Le build doit connaître le bon utilisateur, son home, Home Manager et éventuellement son checkout Git. L’activation du système, elle, a besoin de root.

Je fais donc construire dans le contexte utilisateur puis activer côté helper.

Ça évite aussi de dépendre d’un prompt `sudo` qui apparaîtrait plus ou moins bien au milieu du premier login.

Ce genre de détail n’est pas spectaculaire, mais c’est précisément ce qui rend le provisioning reproductible au lieu de marcher seulement sur mon Mac.

## GitHub n’arrive que quand il sert

Pour un profil Standard ou Direction, je n’ai aucune raison d’imposer GitHub.

Pour un profil Tech, mon implémentation actuelle peut lancer un Device Flow puis cloner `mdm-setup` dans le workspace utilisateur.

<!-- SCREENSHOT 2
Écran GitHub de Omnivya Setup avec un device code expiré.
Ne jamais publier de token, cookie ou URL contenant un secret.
-->

C’est encore un point en mouvement.

Je veux aller vers des releases prébuildées pour que GitHub ne serve plus de canal de distribution de la workstation. En revanche, pour un développeur qui va de toute façon travailler sur les repositories, le Device Flow reste une manière propre de faire l’onboarding sans lui demander de copier un PAT dans un terminal.

## Le premier login est beaucoup moins stable qu’il en a l’air

Le pilote m’a rappelé un truc assez simple : voir le desktop ne veut pas dire que la machine est prête.

Le Setup Assistant peut se terminer alors que Determinate n’est pas encore complètement opérationnel. Le Wi-Fi peut être connecté mais bloqué par un captive portal. Le helper peut ne pas être chargé. Une dépendance présente depuis des mois sur ma machine de dev peut ne pas exister du tout sur un Mac fraîchement effacé.

Du coup, le preflight doit tester l’état dont j’ai réellement besoin.

Je ne veux pas juste vérifier que `nix` existe. Je veux savoir que le daemon fonctionne.

Je ne veux pas juste savoir que macOS a une interface réseau. Je veux savoir que l’auth Entra a une chance de marcher.

Et seulement après, j’ouvre le parcours utilisateur.

Ça évite pas mal de faux problèmes d’authentification qui sont en réalité juste des problèmes de timing.

## J’ai fini par afficher les logs Nix dans l’app

Je n’aime pas trop les barres de progression qui disent « préparation en cours » pendant dix minutes.

Le build Nix fournit déjà beaucoup d’informations, donc autant les exploiter.

L’app affiche une progression, le package en cours et un bout du log. En cas d’échec, on peut retry, exporter les diagnostics et, quand ça a du sens, rollback.

<!-- SCREENSHOT 3
Écran "Preparing your workstation" avec le pourcentage Nix et quelques lignes de log.
Choisir un moment où les noms de derivations restent publiables.
-->

<!-- SCREENSHOT 4
Écran d’erreur avec Try Again / Export Diagnostics / Rollback.
Provoquer volontairement une erreur propre sur le Mac de test.
-->

Pour moi, ça fait complètement partie du sujet Platform Engineering.

Un golden path qui marche uniquement quand tout va bien n’est pas vraiment un golden path. Ce qui compte aussi, c’est ce qu’il raconte quand quelque chose casse.

## La même app doit aussi savoir reprendre un Mac déjà utilisé

Ça m’évite également de créer un deuxième outil pour les machines qui existent déjà.

Sur un Mac neuf, l’app sait qu’elle arrive juste après le bootstrap et peut dérouler son onboarding.

Sur un Mac qui a déjà vécu, elle doit être un peu moins naïve.

Avant de toucher quoi que ce soit, elle peut regarder ce qui existe déjà : Nix, Homebrew, une éventuelle génération nix-darwin, les versions du bootstrap, l’espace disque, les fichiers que Home Manager risque de reprendre et l’état de management du Mac.

Le rôle Entra ne change pas. Le profil cible non plus.

Ce qui change, c’est la manière d’y arriver.

Je veux que ce premier apply « brownfield » montre ce qu’il va faire avant de le faire. Pas besoin de produire un diff de 4 000 lignes Nix, mais au moins dire clairement que la machine va rejoindre le profil Tech, quels composants importants vont être ajoutés, si un conflit a été détecté et si une dépendance existante demande une intervention.

Ensuite seulement, elle converge vers le même état que celui qu’aurait produit une installation neuve.

Ça donne finalement deux points d’entrée vers la même workstation :

~~~text
Mac neuf
  -> ADE
  -> Bootstrap
  -> Setup

Mac existant
  -> Bootstrap manuel
  -> audit local
  -> Setup

puis dans les deux cas
  -> Entra
  -> profil
  -> Nix
  -> même état versionné
~~~

Je préfère largement ça à maintenir un « vieux parc » à côté du nouveau pendant des mois.

## L’app ne doit pas disparaître après le premier boot

Au début je voyais surtout Omnivya Setup comme l’assistant du premier login.

Plus j’avance, moins ça me paraît suffisant.

Une fois le poste construit, j’ai encore besoin de répondre à des questions très simples : quelle version du Bootstrap.pkg est installée, quelle version de l’app tourne, quel Nix est réellement disponible, quelle configuration workstation est active, quel commit l’a produite et vers quoi je peux rollback.

Une partie existe déjà. Le package embarque sa provenance et le helper expose déjà un appel `status`. Mais ce `status` est encore trop pauvre pour en faire un vrai état du poste.

Je veux arriver à quelque chose de ce genre dans l’app :

~~~text
Omnivya Workstation

Bootstrap      0.1.19
Setup.app      0.1.19
Helper         0.1.19 / protocol 2
Nix            <version détectée>

Profile        tech / stable
Configuration  2.7.0
Source         <commit>
System         /nix/store/...
Previous       2.6.1

Last check     il y a 2 h
Status         up to date
~~~

Je ne mettrais pas pour autant la vérification distante dans le daemon root.

Le helper privilégié doit rester bête : lire l’état système, activer une génération, valider, rollback. Pour vérifier périodiquement le registry, un petit LaunchAgent utilisateur me paraît plus propre. Il peut se lancer à l’ouverture de session puis quelques fois par jour, réutiliser silencieusement la session Entra lorsqu’elle existe et simplement mettre à jour l’état affiché par l’app.

Ça évite surtout de donner des tokens utilisateur ou du trafic réseau à un process root qui n’en a pas besoin.

L’app devient alors moins un « wizard qu’on utilise une fois » qu’un petit panneau de contrôle de la workstation.

<!-- SCREENSHOT 5
À faire quand la vue Status existe : écran récapitulatif Bootstrap / app / Nix / profile / config SemVer / commit / previous-known-good.
C’est probablement la meilleure capture pour montrer que le poste est réellement versionné.
-->

## Finalement, l’app reste assez petite

Je ne suis pas en train de construire un produit MDM maison.

L’application sert surtout de colle entre des composants qui ont chacun leur rôle.

SwiftUI gère l’interaction. Entra l’identité. Le helper les privilèges. Nix l’état du poste. Apple Business le bootstrap.

Une fois ce découpage posé, la suite est devenue assez logique.

Je versionne déjà mes services, mes images et mes artefacts. Pourquoi mes postes resteraient-ils sur « la dernière config Git qui a réussi à passer » ?

## Suite

[4/5 : Je versionne mes postes de travail comme du logiciel](/2026-10-06-versionner-postes-semver-nix)

## Sources officielles

- [Apple : SwiftUI](https://developer.apple.com/xcode/swiftui/)
- [Apple : XPC](https://developer.apple.com/documentation/xpc)
- [Microsoft Authentication Library](https://learn.microsoft.com/entra/msal/)
- [GitHub : OAuth device flow](https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
