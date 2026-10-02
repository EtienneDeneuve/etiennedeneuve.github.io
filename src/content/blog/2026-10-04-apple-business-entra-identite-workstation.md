---
title: "Apple Business pour enrôler, Entra pour décider quel poste construire"
description: "Je ne voulais ni mapper des adresses mail à des profils dans un script, ni demander à l’utilisateur quel poste il voulait. J’ai utilisé Entra et des App Roles pour faire de l’identité une entrée du provisioning."
pubDate: 2026-10-04T07:30:00.000Z
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
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-05-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-06-versionner-postes-semver-nix
  - 2026-10-07-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 2/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/2026-10-03-provisioning-mac-pas-probleme-mdm). La suite : [pourquoi j’ai fini par écrire une petite app macOS](/2026-10-05-pourquoi-app-macos-swiftui-provisioning).

Une fois Apple Business limité à son rôle de bootstrap, il me restait une question : comment savoir quel poste construire ?

La réponse facile aurait été de regarder l’adresse mail.

~~~text
alice@entreprise.fr
  -> alice
  -> tech
  -> macbook-alice
~~~

C’est simple, lisible et fragile.

Je ne voulais pas que le code du poste embarque une liste de personnes et décide de leurs droits à partir de leur UPN.

Entra avait déjà l’information dont j’avais besoin.

## Je ne voulais pas d’un écran « choisissez votre profil »

Le pire modèle aurait été de demander au premier login :

~~~text
Quel poste voulez-vous ?

[ Standard ]
[ Direction ]
[ Tech ]
~~~

L’utilisateur ne doit pas choisir son niveau d’accès.

Ce choix appartient au système d’identité.

J’ai donc créé une application Entra dédiée à l’onboarding workstation avec trois App Roles :

~~~text
Workstation.Standard
Workstation.Direction
Workstation.Tech
~~~

Ils correspondent ensuite à mes rôles Nix :

~~~text
Workstation.Standard   -> user
Workstation.Direction  -> direction
Workstation.Tech       -> tech
~~~

L’application macOS ne reçoit donc pas une personne à comparer à une table statique. Elle reçoit une identité authentifiée et un ensemble de claims signés.

<!-- SCREENSHOT 1
Entra > Enterprise applications > Omnivya Workstation > Users and groups.
Montrer les trois App Roles avec quelques comptes de test.
Masquer les emails complets, tenant ID, object IDs et toute donnée non utile.
-->

## L’UPN n’est pas mon identifiant d’autorisation

Une adresse comme `prenom@entreprise.fr` est pratique pour l’UX et pour certaines personnalisations.

Je ne veux pas en faire la clé d’autorisation.

L’identité canonique côté application est construite autour de l’objet Entra et du tenant.

L’UPN peut changer.

Le nom d’affichage peut changer.

L’adresse mail peut changer.

L’objet Entra reste la meilleure ancre pour savoir qui s’est authentifié dans ce tenant.

C’est aussi pour ça que mon application refuse un utilisateur qui n’a aucun App Role attendu plutôt que de lui attribuer un profil par défaut.

Pas de rôle, pas de workstation implicite.

## L’email reste utile, mais pour autre chose

Il y a une nuance intéressante dans mon implémentation actuelle.

Je n’utilise pas l’email pour choisir le rôle, mais je l’utilise encore pour rattacher certains overrides personnels connus dans l’inventaire Nix.

Par exemple, une personne peut avoir un petit module Home Manager spécifique en plus du profil Tech commun.

Le modèle est donc :

~~~text
Entra App Role
    |
    +--> autorise le profil workstation

email / identité connue
    |
    +--> attache éventuellement des personnalisations légitimes
~~~

Ce sont deux responsabilités différentes.

Cette distinction m’a d’ailleurs coûté un bug pendant le pilote : l’authentification Entra était correcte, le rôle était bon, mais le token ne fournissait pas toujours le champ d’email que j’attendais. Le profil général se construisait, mais les modules personnels ne se rattachaient pas.

J’y reviens dans le dernier article de la série, parce que c’est exactement le type de détail qu’un beau schéma d’architecture ne montre jamais.

## Une identité et un device ne sont pas la même chose

La seconde décision a été de casser le lien historique entre personne et hostname.

Dans le repository, les identités et les devices sont maintenant deux inventaires distincts.

Une personne peut avoir deux Macs.

Un Mac peut être remplacé.

Le rôle peut évoluer sans que le device devienne une nouvelle identité.

Et surtout, le premier provisioning n’a pas besoin qu’un développeur ait ajouté au préalable une configuration dédiée à chaque hostname.

Le runtime peut appeler la même fonction de composition avec les paramètres obtenus pendant l’onboarding.

~~~mermaid
flowchart LR
    A[Entra identity] --> B[App Role]
    B --> C[Workstation profile]
    D[Device] --> E[mkWorkstation]
    C --> E
    A --> E
    E --> F[nix-darwin system]
~~~

C’est pour moi le vrai gain.

Je garde un inventaire des machines connues pour l’exploitation courante, mais l’inventaire n’est plus un prérequis au premier boot.

## Les groupes Entra restent derrière l’abstraction

J’aurais pu lire directement les groupes Entra et écrire un mapping entre groupes et profils.

Je préfère utiliser des App Roles comme contrat entre l’identité et la workstation.

Pourquoi ?

Parce que le nom et la structure des groupes appartiennent à l’organisation.

Le rôle workstation appartient à l’application.

Si demain je renomme un groupe, je ne veux pas republier mon application macOS ni modifier le code Nix.

~~~text
groupes Entra
    |
    v
App Role Workstation.*
    |
    v
profil Nix
~~~

L’App Role me donne cette couche d’indirection.

## La politique multi-rôles doit être explicite

Une autre chose que j’ai refusé de laisser au hasard : que faire si un utilisateur possède plusieurs rôles ?

Dans mon implémentation actuelle, la politique est déterministe.

On peut parfaitement préférer rejeter toute ambiguïté.

L’important est que cette règle soit volontaire, documentée et testée.

Une autorisation n’est pas un endroit où j’ai envie de dépendre de l’ordre d’un tableau JSON.

## Ce que voit l’utilisateur

L’utilisateur ne voit finalement presque rien de tout ça.

Il s’authentifie.

L’application affiche ensuite quelque chose comme :

~~~text
Profile detected

Omnivya · tech

Next you’ll connect GitHub for developer access.
~~~

ou un profil non technique où GitHub n’est pas requis.

<!-- SCREENSHOT 2
Omnivya Setup.app sur l’écran "Profile detected".
Faire deux captures si possible : une Tech et une Direction/Standard.
C’est probablement le screenshot le plus parlant de l’article.
-->

Le rôle n’est pas modifiable.

C’était exactement ce que je cherchais : rendre le parcours simple sans transformer la simplicité en faille d’autorisation.

## Une frontière claire

À ce stade, j’avais trois responsabilités bien séparées :

~~~text
Apple Business
  -> ce Mac appartient au parc

Entra
  -> cette personne est authentifiée
  -> elle a droit à ce profil

Nix
  -> voilà ce que ce profil signifie techniquement
~~~

Il me manquait encore une chose.

Tout ça nécessitait de gérer un premier login interactif, des erreurs réseau, un helper root, du retry, des diagnostics et plusieurs étapes qui ne devaient surtout pas finir dans un script shell de 900 lignes.

C’est là que la petite app Swift a commencé à devenir une bonne idée.

## Suite

[3/5 : Pourquoi j’ai fini par écrire une petite app macOS pour provisionner mes postes](/2026-10-05-pourquoi-app-macos-swiftui-provisioning)

## Sources officielles

- [Microsoft identity platform : ID token claims](https://learn.microsoft.com/entra/identity-platform/id-token-claims-reference)
- [Microsoft Entra : App roles](https://learn.microsoft.com/entra/identity-platform/howto-add-app-roles-in-apps)
- [Microsoft identity platform : MSAL](https://learn.microsoft.com/entra/identity-platform/msal-overview)
- [Apple Platform Deployment](https://support.apple.com/guide/deployment/welcome/web)
