---
title: "Apple Business pour enrôler, Entra pour décider quel poste construire"
description: "Je ne voulais ni mapper des adresses mail à des profils dans un script, ni demander à l’utilisateur quel poste il voulait. J’ai utilisé Entra et des App Roles pour faire de l’identité une entrée du provisioning."
pubDate: 2026-10-10T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - Microsoft Entra
  - Apple Business
  - macOS
  - Nix
  - Identity
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-17-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-24-versionner-postes-semver-nix
  - 2026-10-31-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 2/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/). La suite : [pourquoi j’ai fini par écrire une petite app macOS](/thinking/2026-10-17-pourquoi-app-macos-swiftui-provisioning/).

Une fois Apple Business limité à son rôle de bootstrap, il restait une question assez basique : comment le Mac sait-il quel poste construire ?

La première idée qui vient est de regarder l’adresse mail. C’est tentant parce que ça marche vite. On prend `alice@entreprise.fr`, on en déduit Alice, puis un rôle, puis une configuration.

Je n’aimais pas trop.

Une adresse mail est pratique pour afficher un nom, configurer Git ou rattacher quelques préférences. Ce n’est pas une bonne base pour décider de ce qu’un utilisateur a le droit d’installer sur son poste.

Entra avait déjà cette information, donc autant l’utiliser.

## Je ne voulais surtout pas d’un écran « choisissez votre profil »

Ça aurait été la solution la plus simple côté UX et probablement la pire côté modèle.

Je ne veux pas que quelqu’un arrive au premier login et choisisse entre Standard, Direction ou Tech. Le profil n’est pas une préférence utilisateur, c’est une décision d’autorisation.

J’ai donc créé une application Entra dédiée à l’onboarding workstation et trois App Roles : `Workstation.Standard`, `Workstation.Direction` et `Workstation.Tech`.

Côté Nix, ces rôles sont traduits vers mes profils `user`, `direction` et `tech`.

L’idée est très simple : l’application ne demande jamais « qu’est-ce que tu veux ? ». Elle demande à Entra « qui es-tu et qu’est-ce que tu as le droit d’avoir ? ».

<!-- SCREENSHOT 1
Entra > Enterprise applications > Omnivya Workstation > Users and groups.
Montrer les App Roles avec quelques comptes de test.
Masquer les emails complets, tenant ID, object IDs et toute donnée non utile.
-->

## L’UPN reste utile, mais il ne décide pas du rôle

Je garde évidemment l’UPN et l’email. Ils servent.

Dans mon cas, l’email me permet par exemple de rattacher quelques personnalisations connues dans l’inventaire Nix : un module Home Manager particulier, quelques outils personnels, ce genre de choses.

Mais ça arrive **après** la décision d’autorisation.

Le rôle vient d’Entra. Les personnalisations viennent éventuellement de l’identité connue dans le repo.

Cette séparation m’a d’ailleurs permis de voir un bug assez vite pendant le pilote : l’utilisateur était correctement authentifié, l’App Role était bon, mais le claim que j’utilisais pour récupérer l’email n’était pas toujours présent. Le poste recevait donc le bon profil général, mais certaines personnalisations ne s’attachaient pas.

C’est un bon rappel : un claim pratique n’est pas forcément un invariant. Si j’en ai réellement besoin pour construire le poste, je dois le valider explicitement.

J’y reviens dans le dernier article parce que ce genre de détail est beaucoup plus intéressant que le schéma parfait sur un slide.

## Une identité n’est pas un device

J’en ai profité pour casser un autre couplage historique : une personne n’est pas son Mac.

Avant, un hostname connu amenait presque naturellement vers un utilisateur, puis vers un rôle. Ça fonctionne jusqu’au jour où quelqu’un a deux machines, change de rôle ou remplace son Mac.

Le repository sépare maintenant les identités et les devices. Le runtime peut construire une workstation avec les informations récupérées au moment du provisioning, sans exiger qu’un nouveau hostname ait été ajouté dans Git la veille.

C’est ce que fait `mkWorkstation`.

~~~mermaid
flowchart LR
    A[Entra identity] --> B[App Role]
    B --> C[Workstation profile]
    D[Device] --> E[mkWorkstation]
    C --> E
    A --> E
    E --> F[nix-darwin system]
~~~

Je garde bien sûr un inventaire des machines connues pour l’exploitation courante. Je ne veux simplement plus que cet inventaire soit un prérequis au premier boot.

## Pourquoi des App Roles plutôt que les groupes directement

J’aurais pu lire les groupes Entra et écrire un mapping en dur.

Ça aurait marché.

Mais le nom d’un groupe appartient à l’organisation. Le rôle workstation appartient à l’application.

Je préfère donc garder une couche d’indirection :

~~~text
groupes Entra
    -> App Role Workstation.*
    -> profil Nix
~~~

Si demain un groupe change de nom ou si l’organisation bouge, je peux adapter l’assignation côté Entra sans changer le code de l’application ni la logique Nix.

C’est un petit détail d’architecture, mais j’aime bien ce genre de détails : ils évitent de faire fuiter l’organisation interne jusque dans le code du poste.

## Et si quelqu’un a plusieurs rôles ?

Il faut décider.

Dans mon implémentation actuelle, la résolution est déterministe. On pourrait tout aussi bien choisir de rejeter toute ambiguïté.

Ce qui compte, c’est de ne pas laisser cette décision à l’ordre d’un tableau JSON ou au hasard du token.

L’autorisation doit être volontaire.

## Reprendre sans redemander de se connecter

Un détail assez important est arrivé pendant les retries du pilote : authentifier correctement l’utilisateur une fois ne sert à rien si chaque relance ouvre à nouveau Microsoft, puis GitHub.

MSAL essaie maintenant d’abord de récupérer silencieusement un token depuis son cache. Si la session est toujours valable, le parcours reprend sans nouvelle fenêtre. Même chose côté GitHub : le token conservé dans Keychain est réutilisé tant qu’il permet toujours d’accéder au repository attendu.

Je garde volontairement une règle stricte pour le mode headless : l’agent de fond n’ouvre jamais une authentification interactive. S’il n’a pas les credentials nécessaires, il note l’état et attend le prochain passage dans l’app.

Ça paraît être un détail d’UX, mais sur un workflow récupérable c’est assez fondamental. Un retry doit reprendre un état, pas rejouer tout l’onboarding comme si rien n’avait existé.

Sur les Macs adoptés sans ADE, j’ai aussi gardé le hostname visible tel quel. L’identité utilisateur peut servir à dériver le nom logique utilisé par la configuration Nix sans renommer brutalement une machine qui a déjà une histoire.

## Ce que voit réellement l’utilisateur

Presque rien.

Il s’authentifie, puis l’application affiche le profil détecté.

Pour un poste Tech, elle indique que GitHub sera demandé ensuite. Pour un poste Direction ou Standard, elle indique que GitHub n’est pas nécessaire.

<!-- SCREENSHOT 2
Omnivya Setup.app sur l’écran "Profile detected".
Faire deux captures si possible : une Tech et une Direction/Standard.
-->

Le rôle n’est pas modifiable.

C’était exactement ce que je cherchais : le parcours reste très simple, mais la simplicité ne vient pas d’un gros bouton « faites-moi confiance ». Elle vient du fait que l’identité a déjà fait le travail.

À ce stade, le modèle commençait à devenir propre : Apple Business sait que le Mac appartient au parc, Entra sait qui est devant, Nix sait ce que signifie le profil.

Il me restait encore à gérer tout ce qui se passe entre ces trois mondes au premier login.

C’est là que j’ai arrêté de vouloir résoudre le problème avec des scripts.

## Suite

[3/5 : Pourquoi j’ai fini par écrire une petite app macOS pour provisionner mes postes](/thinking/2026-10-17-pourquoi-app-macos-swiftui-provisioning/)

## Sources officielles

- [Microsoft identity platform : ID token claims](https://learn.microsoft.com/entra/identity-platform/id-token-claims-reference)
- [Microsoft Entra : App roles](https://learn.microsoft.com/entra/identity-platform/howto-add-app-roles-in-apps)
- [Microsoft identity platform : MSAL](https://learn.microsoft.com/entra/identity-platform/msal-overview)
- [Apple Platform Deployment](https://support.apple.com/guide/deployment/welcome/web)
