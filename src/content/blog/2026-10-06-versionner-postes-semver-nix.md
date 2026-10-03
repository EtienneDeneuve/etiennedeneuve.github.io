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

Il y a un truc que je trouve bizarre dans la gestion des postes.

Pour un service, une image ou une application en production, on veut savoir exactement quelle version tourne. On veut pouvoir retrouver le commit, reproduire le build et revenir en arrière si nécessaire.

Pour un laptop, on accepte encore très facilement « il a fait un git pull hier normalement ».

Je n’aime pas trop cette différence.

Si le poste est une plateforme de travail importante, je veux savoir ce que j’ai déployé dessus.

## J’ai commencé par le Bootstrap.pkg

Le premier truc facile à versionner était le package lui-même.

Aujourd’hui, le build produit un artefact nommé avec sa version et le commit source, puis embarque un petit fichier de provenance. Quand je diagnostique un Mac, je peux donc retrouver la version du package, celle de l’app, la révision de `mdm-setup` embarquée et la date du build.

<!-- SCREENSHOT 1
Terminal ou Finder montrant le nom versionné du PKG et un extrait propre de provenance.json.
Masquer les URLs SAS éventuelles et les identifiants qui n’apportent rien.
-->

Ce n’est pas très sophistiqué, mais ça répond déjà à une question qui devient vite pénible sans ça : **qu’est-ce que cette machine a réellement reçu ?**

## La version déclarée ne suffit pas, je veux l’état réellement observé

Mettre `2.7.0` dans un manifest ne sert pas à grand-chose si le Mac est incapable de me dire ce qu’il exécute vraiment.

Je veux donc distinguer deux choses.

Il y a l’état **appliqué**, écrit par le helper au moment où une génération est activée et validée : version SemVer, commit source, profil, channel, top-level Nix store path, date d’application et previous-known-good.

Et il y a l’état **observé** : version de macOS, version du Bootstrap.pkg, version de l’app, version du helper/protocole, version Nix disponible, santé du daemon et génération système réellement pointée par le profil Nix.

Si les deux ne correspondent plus, j’ai du drift. Et ce drift doit être visible au lieu d’être découvert pendant le prochain incident.

Je pense aussi exposer exactement le même modèle en CLI :

~~~text
omnivya-nix status
omnivya-nix doctor
omnivya-nix inventory
~~~

avec une sortie JSON utilisable par l’app. Je n’ai pas envie d’avoir une logique de diagnostic différente entre le bouton SwiftUI et le terminal.

Pour les logiciels installés, je ne veux pas afficher une liste de 800 store paths dans l’écran principal. Je préfère un inventaire de release généré au build, avec les outils réellement déclarés et leurs versions, puis un état observé pour les quelques briques qui échappent à Nix, notamment les casks Homebrew encore nécessaires.

Le détail complet reste exportable pour le support, mais l’écran normal doit surtout répondre à « quelle workstation est installée ici ? ».

<!-- SCREENSHOT 2
Quand le status dashboard existe : vue app avec versions Bootstrap / Setup / Helper / Nix / config SemVer / SHA / active store path.
-->

## Tant qu’à connaître cet état, autant le remonter

À partir du moment où le poste sait dire précisément ce qu’il est, garder cette information uniquement en local serait un peu dommage.

Je veux donc remonter un état très léger vers Grafana : version workstation, version du bootstrap, version de l’app et du helper, version Nix, profil, mode ADE ou adoption, drift éventuel, dernier apply, santé du daemon et quelques métriques utiles autour du disque ou des updates.

Je ne veux surtout pas installer un collector complet sur chaque Mac juste pour ça.

L’agent workstation sait déjà produire ces données. Il peut donc émettre directement de l’OTLP/HTTP vers un Alloy central.

Le chemin que je retiens ressemble plutôt à ça :

~~~text
Omnivya Workstation Agent
        |
        | OTLP/HTTP
        | Entra access token
        v
Tailscale
        |
        v
auth gateway
        |
        v
Grafana Alloy
        |
        +--> metrics
        +--> logs
        +--> traces
        |
        v
Grafana
~~~

Tailscale garde le endpoint hors d’Internet et limite les machines qui peuvent le joindre. Entra reste la couche d’autorisation applicative.

Je préfère garder les deux.

Et surtout, Alloy reste au centre. Pas question d’installer Alloy sur tout le parc uniquement pour exporter quelques événements de workstation.

Le gateway devant Alloy sert surtout à valider proprement le token Entra avant de laisser passer l’OTLP. Je préfère ça à bricoler un bearer token statique commun à toutes les machines.

Une update pourrait alors devenir une vraie trace : preflight, résolution du profil, download, vérification de l’artefact, import Nix, activation et validation. Si ça casse, je peux partir du dashboard du parc et descendre jusqu’à l’étape exacte du run concerné.

Ce n’est pas indispensable pour faire fonctionner le provisioning.

Par contre, le jour où j’ai vingt, cinquante ou cent machines, ça change complètement la manière de répondre à « qui est encore en 2.6.1 ? », « quelles machines ont du drift ? » ou « pourquoi la dernière update casse uniquement sur trois Macs ? ».

<!-- SCREENSHOT 3
À faire quand la télémétrie existe : dashboard Grafana fleet avec versions workstation, ADE/adoption, drift et health.
Pas besoin de montrer les noms des utilisateurs.
-->

## Je préfère SemVer à « stable »

J’avais commencé à parler de channels `stable` et `pilot`, puis je me suis rendu compte que ça ne suffisait pas.

Un channel dit à qui je propose une release.

Il ne dit pas ce qu’est cette release.

Je préfère donc donner une vraie version à la configuration workstation elle-même : `2.6.1`, `2.7.0-pilot.1`, `2.7.0`, etc.

Le channel reste utile pour décider qu’un petit groupe peut voir les prereleases alors que le reste du parc reste sur la dernière stable.

Mais la release, elle, garde une identité propre.

Et je conserve évidemment le SHA exact derrière la version. SemVer est pratique pour parler entre humains ; le commit reste la provenance technique.

## Le pilote actuel n’est pas encore la cible finale

Pour aller vite, l’app sait aujourd’hui construire depuis le snapshot Nix embarqué dans le package.

Sur un poste Tech, elle peut aussi faire le login GitHub, cloner `mdm-setup` et utiliser ce checkout.

C’était très pratique pour valider toute la chaîne sans construire un système de distribution complet dès le début.

Je ne veux simplement pas garder ce modèle comme cible.

GitHub est une très bonne source de développement. Je ne veux pas qu’il devienne une dépendance runtime pour tous les utilisateurs.

Quelqu’un qui a un poste Direction n’a aucune raison d’avoir un compte GitHub juste pour récupérer Word, Edge, quelques réglages et son environnement de travail.

## Je veux donc builder les profils avant

La suite logique est de déplacer le build hors du poste.

Une release de `mdm-setup` construit les profils supportés, produit des artefacts immuables, les signe et les publie dans un stockage objet privé.

Le Mac ne clone plus le repository pour savoir quoi devenir. Il récupère la release qui correspond à son profil.

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

Pour la première version, je partirais probablement sur une closure exportée par profil.

Si ça devient trop gros ou trop redondant, le même stockage peut évoluer vers un vrai binary cache Nix. Mais je préfère mesurer avant de construire tout de suite la version la plus élégante sur le papier.

## Le stockage n’a pas besoin d’un secret dans l’app

L’application vient déjà d’authentifier l’utilisateur avec Entra.

Autant réutiliser cette identité pour lire le registry et les artefacts plutôt que d’embarquer une clé de stockage dans le binaire.

Le rôle Entra détermine le profil autorisé. Le registry dit quelle version de ce profil est disponible. Le manifest pointe vers l’artefact exact.

J’ajouterais malgré tout une signature sur les manifests.

Le fait qu’un utilisateur puisse lire un objet dans le Blob ne veut pas dire que le helper doit accepter aveuglément son contenu.

Ce sont deux sujets différents : l’accès au stockage et la confiance dans ce qu’on applique sur la machine.

## Je veux aussi connaître le coût disque avant de télécharger

C’est là que le sujet devient plus concret.

Une closure Nix n’est pas forcément petite. Sur un Mac de 512 Go, télécharger plusieurs générations complètes sans stratégie de rétention peut devenir idiot assez vite.

Le manifest doit donc contenir suffisamment d’informations pour que l’app sache avant le téléchargement si l’update est raisonnable : taille compressée, taille de closure, version minimum du bootstrap, version minimum de macOS, digest de l’artefact.

Pas besoin d’un protocole énorme. Juste assez pour éviter de découvrir à 95 % du téléchargement qu’il manque 20 Go.

## Et surtout, garder un vrai rollback

Je veux toujours pouvoir revenir à la dernière génération connue comme bonne.

La politique que j’ai retenue est donc assez simple : garder la version courante et la `previous-known-good`. Le reste peut devenir éligible au garbage collection une fois que la nouvelle version a été activée et validée.

Je ne veux surtout pas lancer un GC agressif avant cette validation.

Sinon, on transforme le mécanisme de rollback en décoration.

C’est aussi pour ça que je préfère que l’application connaisse les versions appliquées et les store paths protégés plutôt que de laisser un cron Nix faire le ménage tout seul dans son coin.

## Au fond, ça ressemble beaucoup à une supply chain logicielle

C’est probablement le point qui m’intéresse le plus dans tout ça.

Je ne cherche pas à faire un « super MDM ». Je cherche surtout à traiter le poste comme un artefact que je peux fabriquer, identifier, vérifier, déployer et reprendre.

La source reste dans Git.

Le build produit quelque chose de précis.

Le stockage distribue.

Entra autorise.

L’application orchestre.

Nix applique.

Et si ça casse, je sais quelle version j’essaie de poser et vers laquelle je peux revenir.

Ça me paraît beaucoup plus sain que « relance le script d’update et regarde si ça passe ».

La théorie est assez jolie. Évidemment, le premier Mac réellement effacé m’a rapidement rappelé qu’entre le diagramme et la machine il y a `appstored`, PackageKit, des claims Entra incomplets, Homebrew qui n’existe pas et quelques autres détails sympathiques.

C’est la dernière partie.

## Suite

[5/5 : Ce qui casse quand on essaie vraiment de provisionner un Mac de zéro](/2026-10-07-ce-qui-casse-provisioning-macos)

## Sources officielles

- [Semantic Versioning](https://semver.org/)
- [Nix manual : store](https://nix.dev/manual/nix/latest/store/)
- [NixOS Wiki : Binary Cache](https://wiki.nixos.org/wiki/Binary_Cache)
- [Microsoft : Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/azure/storage/blobs/authorize-access-azure-active-directory)
