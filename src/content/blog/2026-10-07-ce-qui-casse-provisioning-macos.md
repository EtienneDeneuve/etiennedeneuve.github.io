---
title: "Ce qui casse quand on essaie vraiment de provisionner un Mac de zéro"
description: "Le schéma Apple Business + Entra + Nix était propre. Le premier Mac effacé m’a rappelé tout ce qu’un diagramme ne montre pas : format PKG, appstored, claims incomplets, Homebrew absent et mauvaise source Nix."
pubDate: 2026-10-07T07:30:00.000Z
language: fr
contentType: field-note
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - macOS
  - Apple Business
  - Nix
  - Troubleshooting
  - Platform Engineering
featured: true
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-04-apple-business-entra-identite-workstation
  - 2026-10-05-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-06-versionner-postes-semver-nix
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 5/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/2026-10-03-provisioning-mac-pas-probleme-mdm).

Le schéma était propre.

~~~text
Apple Business
  -> Determinate
  -> Bootstrap

Premier login
  -> Entra
  -> profil
  -> Nix
  -> poste prêt
~~~

Puis j’ai effacé un Mac et j’ai essayé pour de vrai.

C’est là que le sujet est devenu intéressant.

## « Le profile est arrivé » ne veut pas dire « le package est installé »

Première confusion facile avec le nouveau Built-in Management d’Apple Business : voir la déclaration du package côté Mac ne prouve pas que le package a fini son installation.

J’ai donc fini par regarder la chaîne réelle :

~~~text
mdmclient
   |
   v
appstored
   |
   v
installd
~~~

Les logs racontent beaucoup plus de choses que l’interface.

Sur une de mes premières tentatives, le téléchargement s’était parfaitement terminé.

Puis :

~~~text
Could not create PKProduct
The file “Distribution” doesn’t exist.
~~~

<!-- SCREENSHOT 1
Capture Terminal du log appstored montrant :
Finished asset promise
Could not create PKProduct
"The file “Distribution” doesn’t exist."
Garder 6 à 10 lignes maximum et masquer UUID/serial si nécessaire.
-->

Le problème n’avait rien à voir avec le Blueprint, le réseau ou le stockage.

Mon package était simplement du mauvais type.

## pkgbuild n’était pas la fin de l’histoire

J’avais construit un component package avec `pkgbuild`.

Il contenait bien le payload, les scripts et les métadonnées attendues par Installer.

Mais `appstored`, dans ce chemin de déploiement Apple Business, attendait un product archive avec un `Distribution` au niveau supérieur.

Le pipeline est donc devenu :

~~~text
xcodebuild
  -> codesign app + helper
  -> pkgbuild
  -> productbuild
  -> productsign
  -> notarize
  -> Blob
  -> Apple Business
~~~

J’ai même ajouté un test au build qui expand le package final et refuse la release si `Distribution` n’existe pas.

Parce que la meilleure manière de ne pas rediagnostiquer le même bug trois mois plus tard est de le transformer en invariant de pipeline.

<!-- SCREENSHOT 2
Terminal :
pkgutil --expand <pkg> /tmp/check
find /tmp/check -maxdepth 2
avec Distribution + le component pkg imbriqué.
Très visuel, peu de texte.
-->

## Un Mac neuf n’est pas mon Mac de développement

Le second rappel a été plus classique.

Sur ma machine, certaines dépendances existaient déjà.

Sur un Mac qui vient de passer par Setup Assistant, non.

Homebrew en est un bon exemple.

Une configuration nix-darwin qui active des casks peut très bien fonctionner depuis des mois sur mon poste et casser immédiatement sur une machine où `brew` n’existe simplement pas encore.

Ma première réaction a été de bootstrapper Homebrew avant l’activation.

Puis le test m’a forcé à reposer la question : **est-ce que j’ai réellement besoin de Homebrew pour ce profil ?**

Pour le Mac pilote concerné, j’ai finalement déplacé plusieurs applications vers Nix et réduit la dépendance à Homebrew.

C’est exactement le type de correction que j’aime bien : le bug ne produit pas uniquement un `if` supplémentaire, il pousse le modèle dans une direction plus cohérente.

## Le bon rôle Entra ne suffisait pas

J’ai également eu un cas plus subtil.

L’utilisateur s’authentifiait correctement.

L’App Role était présent.

Le rôle workstation était donc correctement résolu.

Mais certains modules personnels ne se chargeaient pas.

La raison était simplement que mon code utilisait aussi l’adresse email pour rattacher les overrides d’une identité connue, et que `preferred_username` n’était pas toujours présent comme je l’avais supposé.

J’ai dû rendre la récupération plus robuste :

~~~text
preferred_username
  sinon email
  sinon upn
  sinon username MSAL
~~~

et surtout refuser de poursuivre une construction qui a besoin de cet email si je n’en possède aucun.

L’enseignement est moins « attention à preferred_username » que celui-ci :

> Une claim utile à l’UX n’est pas automatiquement un invariant de ton protocole.

Si une donnée devient obligatoire dans la construction, elle doit être validée explicitement.

## J’ai aussi construit la bonne configuration… depuis le mauvais endroit

Autre bug assez savoureux : pour un profil Tech, l’application avait correctement authentifié GitHub et cloné `mdm-setup`.

Puis le provisioning continuait à construire depuis le snapshot embarqué dans le Bootstrap.pkg.

Le checkout Git contenait donc les dernières personnalisations, mais la machine appliquait une version plus ancienne.

Tout « marchait ».

Les bonnes applications n’arrivaient simplement jamais.

J’ai corrigé le moteur pour préférer explicitement le checkout utilisateur lorsqu’il existe, puis retomber sur le snapshot du package.

~~~text
checkout utilisateur
  -> préféré

snapshot embarqué
  -> fallback bootstrap
~~~

C’est également une des raisons pour lesquelles je veux maintenant aller vers des releases explicites plutôt qu’un mélange implicite de « snapshot embarqué » et « repo éventuellement plus récent ».

## Les applications Home Manager ne sont pas toutes dans /Applications

Encore un détail banal qui peut faire perdre du temps pendant un pilote.

Certaines applications gérées par Home Manager arrivent dans :

~~~text
~/Applications/Home Manager Apps/
~~~

et pas dans :

~~~text
/Applications
~~~

Quand le provisioning annonce « success » et que quelqu’un regarde uniquement Launchpad ou `/Applications`, on peut conclure un peu vite que le build n’a rien installé.

L’observabilité d’un bootstrap doit donc inclure l’endroit où il a mis les choses.

Ce n’est pas glamour, mais c’est du support évité.

## « nix existe » n’est pas la même chose que « Determinate est prêt »

Le premier login introduit aussi une race assez intéressante.

Le Blueprint peut avoir livré Determinate et le binaire `nix` peut être présent alors que tout l’environnement n’est pas encore correctement initialisé.

Dans le pilote, je vérifie désormais plus précisément la santé attendue autour du daemon et du store.

Je garde également Determinate comme package séparé.

Je ne veux pas l’embarquer dans mon Bootstrap.pkg : il possède son propre cycle d’installation et de maintenance.

Le bootstrap Omnivya doit savoir constater « Nix n’est pas prêt », pas réimplémenter Determinate.

## Les trois durcissements que je considère obligatoires avant généralisation

Les premiers runs m’ont également fait ajouter trois sujets au backlog.

Le premier est **ServiceManagement**.

Sur les versions récentes de macOS, un utilisateur peut contrôler certains éléments exécutés en arrière-plan. Un helper indispensable au provisioning doit donc être explicitement géré par le payload MDM adéquat, avec des identifiants et règles suffisamment précis.

Le second est le **réseau du premier login**.

~~~text
Wi-Fi connecté
!=
Internet réellement utilisable
~~~

Un captive portal ne doit pas lancer une boucle MSAL absurde.

Je veux donc un vrai preflight réseau avant l’authentification.

Le troisième est le **garbage collection Nix**.

Si je passe aux closures prébuildées décrites dans l’article précédent, un Mac de 512 Go ne doit pas conserver indéfiniment chaque génération téléchargée.

La règle que je retiens est :

~~~text
current
+ previous-known-good
= protégés

le reste
= GC eligible
~~~

Pas avant validation de la nouvelle génération.

## Le point commun de tous ces bugs

Aucun de ces problèmes ne remet en cause le découpage Apple Business + Entra + Nix.

Au contraire.

Ils ont surtout révélé les frontières réelles entre les composants.

~~~text
Apple Business a bien livré la déclaration.
appstored a bien téléchargé le package.
PackageKit a refusé son format.

Entra a bien authentifié l’utilisateur.
L’App Role était correct.
Ma logique de personnalisation attendait une claim différente.

GitHub avait bien cloné le repo.
Nix fonctionnait.
Mon moteur avait choisi la mauvaise source.
~~~

C’est exactement pour ça que je préfère les architectures où chaque étape possède une responsabilité identifiable.

Quand ça casse, je peux demander **quelle frontière a été franchie correctement et laquelle ne l’a pas été**.

## Ce que je retiens du pilote

Je garderais le même découpage.

Mais je ne considérerais plus jamais un parcours de provisioning comme validé tant qu’il n’a pas passé plusieurs installations réellement propres.

Pas « j’ai supprimé deux fichiers et relancé ».

Un vrai erase.

Un vrai Setup Assistant.

Un vrai premier login.

Un réseau imparfait.

Un utilisateur qui n’a pas les outils du développeur qui a écrit le bootstrap.

C’est là qu’on découvre si le système provisionne vraiment une workstation ou s’il reproduit simplement l’environnement de son auteur.

Et c’est probablement le point le plus utile de toute cette série.

## Sources officielles

- [Apple Business : macOS packages](https://support.apple.com/guide/business/create-a-package-axm8e397e77d/web)
- [Apple Platform Deployment](https://support.apple.com/guide/deployment/welcome/web)
- [Determinate Systems : Deploy Determinate with MDM](https://docs.determinate.systems/guides/mdm/)
- [Nix manual](https://nix.dev/manual/nix/latest/)
