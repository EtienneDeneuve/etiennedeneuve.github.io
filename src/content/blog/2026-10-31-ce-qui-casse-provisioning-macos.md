---
title: "Ce qui casse quand on essaie vraiment de provisionner un Mac de zéro"
description: "Le schéma Apple Business + Entra + Nix était propre. Le premier Mac effacé m’a rappelé tout ce qu’un diagramme ne montre pas : format PKG, appstored, claims incomplets, Homebrew absent et mauvaise source Nix."
pubDate: 2026-10-31T07:30:00.000Z
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
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-10-apple-business-entra-identite-workstation
  - 2026-10-17-pourquoi-app-macos-swiftui-provisioning
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 5/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/).

Le schéma était propre.

Apple Business installe Determinate puis mon Bootstrap.pkg. Au premier login, Entra identifie l’utilisateur, l’app résout le profil, Nix construit le poste et tout le monde est content.

Puis j’ai effacé un Mac et j’ai essayé pour de vrai.

Évidemment, c’est là que ça devient intéressant.

## Voir le package dans le profil ne veut pas dire qu’il est installé

Premier piège : côté Mac, je voyais bien les déclarations des packages arrivées depuis Apple Business.

J’aurais pu conclure que le problème était ailleurs.

En regardant les logs, la réalité était plus simple : `appstored` avait bien téléchargé mon package, puis l’installation s’était arrêtée immédiatement.

Le message était assez parlant :

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

Le réseau marchait. Apple Business avait fait son travail. Le fichier avait été récupéré.

Mon package était juste mauvais.

## pkgbuild tout seul ne suffisait pas

J’avais construit un component package avec `pkgbuild`.

Il était parfaitement installable localement, donc au premier regard rien de choquant.

Sauf que dans ce chemin de déploiement, `appstored` attendait un product archive avec un fichier `Distribution` au niveau supérieur.

J’ai donc changé le pipeline pour passer aussi par `productbuild`.

Depuis, le build vérifie lui-même le contenu du package final. Il l’expand et échoue si `Distribution` n’est pas là.

<!-- SCREENSHOT 2
Terminal avec pkgutil --expand sur le PKG final, puis Distribution + le component pkg.
-->

C’est typiquement le genre de bug que je préfère transformer en test plutôt qu’en note dans un wiki.

Sinon, six mois plus tard, quelqu’un reconstruit le package légèrement différemment et on repart lire les logs `appstored`.

## Le Mac propre m’a aussi montré toutes mes dépendances invisibles

Sur mon poste, Homebrew existe depuis longtemps.

Sur un Mac fraîchement effacé, non.

Ça paraît évident dit comme ça. Ça l’est beaucoup moins quand une activation nix-darwin fonctionne depuis des mois chez toi et casse uniquement pendant un vrai enrollement ADE.

Une partie de mes profils utilisait encore des casks Homebrew. L’activation arrivait donc sur un système où `brew` n’existait tout simplement pas.

J’ai d’abord ajouté le bootstrap nécessaire, puis j’ai repris le problème dans l’autre sens : est-ce que ces applications ont réellement besoin de passer par Homebrew ?

Le compromis actuel est plus propre. Le preflight traite maintenant Homebrew comme une vraie dépendance : s’il manque, Setup le détecte et sait l’installer dans le contexte utilisateur. Si les Command Line Tools manquent, il demande d’abord leur installation au lieu de laisser Homebrew échouer plus loin.

En parallèle, j’ai déplacé ce qui avait du sens vers Nix. VS Code est par exemple revenu côté Nix alors qu’Edge et Office restent encore des casks dans le profil concerné.

Je préfère nettement ça à l’empilement d’un script caché dans un `postinstall` juste parce que ma machine de développement avait masqué le problème.

## Entra fonctionnait, mais il me manquait quand même une information

Autre bug plus subtil : le login Entra passait, l’App Role était correct et le bon profil workstation était choisi.

Pourtant, certaines personnalisations utilisateur n’arrivaient pas.

Le problème venait de l’email.

Le rôle ne dépend pas de l’email, et je veux que ça reste comme ça. En revanche, mon inventaire Nix utilise encore l’adresse pour rattacher certains modules personnels connus.

J’avais supposé que `preferred_username` serait toujours disponible.

Ce n’était pas suffisamment robuste.

J’ai donc ajouté les fallbacks nécessaires et surtout rendu cette donnée obligatoire lorsque le build en a besoin. Si l’app ne sait pas correctement identifier l’utilisateur pour rattacher ses personnalisations, elle ne doit pas continuer silencieusement avec un poste à moitié bon.

C’est un détail, mais il illustre bien la différence entre « l’auth marche » et « j’ai toutes les données nécessaires pour construire correctement la machine ».

## J’ai réussi à cloner la bonne config… puis à ne pas l’utiliser

Celui-là m’a bien fait rire.

Sur un profil Tech, le Device Flow GitHub fonctionnait. Le repository `mdm-setup` était cloné dans le home utilisateur.

Et ensuite le moteur Nix continuait à construire depuis le snapshot embarqué dans le Bootstrap.pkg.

Donc tout le parcours GitHub était correct, le repo était bien là, mais les derniers changements n’étaient jamais utilisés.

Le Mac construisait consciencieusement la mauvaise version.

J’ai corrigé la résolution des sources pour préférer le checkout utilisateur lorsqu’il existe, puis retomber sur le snapshot du bootstrap en fallback.

Ça marche pour le pilote, mais c’est justement le genre de situation qui m’a convaincu d’aller vers des releases explicites et prébuildées : je préfère qu’une version soit choisie volontairement plutôt que « la source la plus fraîche qu’on a trouvée quelque part sur le disque ».

## Et certaines apps n’étaient simplement pas là où je les cherchais

Home Manager ajoute encore une petite surprise : certaines applications utilisateur arrivent dans `~/Applications/Home Manager Apps/`, pas dans `/Applications`.

Le provisioning disait success.

Je regardais `/Applications`.

Je ne voyais pas ce que j’attendais.

Ça ressemble à un échec alors que le système a fait exactement ce qu’on lui a demandé.

Depuis, je considère aussi ce genre d’information comme faisant partie des diagnostics. Si le bootstrap installe quelque chose dans un endroit peu évident, il doit être capable de l’expliquer.

C’est beaucoup moins cher que de redécouvrir le comportement à chaque ticket.

## « nix existe » n’est pas non plus synonyme de « Determinate est prêt »

Autre race du premier login : le binaire peut être présent alors que l’environnement n’est pas encore complètement opérationnel.

Au début, mon preflight était trop optimiste.

Je vérifiais en gros que Nix existait.

Maintenant je veux savoir que le daemon répond réellement et que le store est utilisable avant de lancer la suite.

Même chose pour le réseau : une interface Wi-Fi connectée derrière un captive portal n’est pas un accès Internet utilisable pour MSAL.

Cette partie est maintenant explicite dans le preflight. L’app attend un path utilisable, vérifie le captive portal puis teste réellement l’endpoint Microsoft avant d’ouvrir Entra. Si ça ne passe pas, elle attend et retry avec backoff au lieu d’empiler des fenêtres d’auth.

Je préfère largement ça à transformer un problème de réseau en faux incident d’identité.

## macOS m’a aussi rappelé que root n’est pas tout-puissant

Un autre bug du pilote a été plus intéressant.

L’activation nix-darwin devait modifier certains fichiers sous `/etc/pam.d` pour gérer le Touch ID sudo. Le helper tournait bien en root, et pourtant macOS répondait `Operation not permitted`.

La cause n’était pas Nix. C’était macOS et ses protections de confidentialité.

Le pilote est passé après avoir donné manuellement le Full Disk Access au helper. Pour le parc, je ne veux évidemment pas demander ça à chaque utilisateur, donc j’ai documenté le payload PPPC `SystemPolicyAllFiles` à pousser avant le bootstrap.

Même logique pour les éléments de fond : le helper et l’agent ont maintenant leurs Labels dédiés et doivent être gérés via ServiceManagement / Managed Login Items pour éviter qu’un utilisateur puisse désactiver une brique nécessaire au fonctionnement du poste.

Je limite aussi le scope. Le Full Disk Access va au helper qui écrit réellement dans le système, pas à Setup.app ni à l’agent utilisateur.

Le cas du Touch ID m’a également poussé à le garder sur les profils Tech où il apporte quelque chose, plutôt que d’imposer cette modification à tout le monde.

Au final, l’ordre du Blueprint est devenu beaucoup plus précis :

~~~text
Determinate
  -> ServiceManagement
  -> PPPC Full Disk Access
  -> Omnivya Bootstrap
~~~

Ce sont exactement les détails qu’on ne voit pas dans le premier diagramme d’architecture, mais qui font la différence entre « ça marche sur mon Mac » et un déploiement réellement automatisable.

## Le disque reste le prochain piège évident

Si je distribue demain des closures Nix prébuildées, je ne veux pas transformer les SSD de 512 Go en archive historique du parc.

Je garderai la génération courante et la `previous-known-good`. Une génération plus ancienne ne mérite pas de rester uniquement « au cas où », surtout si le rollback est déjà assuré par la précédente.

Mais le GC ne doit arriver qu’après validation de la nouvelle génération. Sinon, on peut très facilement supprimer le seul rollback qui nous aurait été utile.

## Une UI de recovery que je peux enfin montrer

Au début, beaucoup de logique de reprise existait surtout dans le code.

Elle est maintenant visible.

Le preflight affiche ses gates, le provisioning montre les étapes Build / Install / Activate / Validate, et en cas d’échec l’app affiche les checkpoints déjà passés ainsi que l’endroit exact où Try Again va reprendre.

Le Done screen est lui aussi devenu un vrai petit dashboard avec l’état Entra, GitHub, helper, MDM, bootstrap, macOS, Nix et Homebrew.

<!-- SCREENSHOT 3
FailedView actuel avec Progress saved + Next, ou Done dashboard 0.1.31.
Les deux sont de bonnes captures de REX réel.
-->

Je trouve ça beaucoup plus intéressant qu’un simple écran vert « success ». Le système commence à pouvoir expliquer son propre état.

## Finalement, aucun de ces bugs n’a changé l’architecture

C’est probablement ce que je trouve le plus intéressant.

Apple Business avait bien livré la déclaration.

`appstored` avait bien téléchargé le package.

PackageKit refusait son format.

Entra avait bien authentifié l’utilisateur.

L’App Role était bon.

Ma logique de personnalisation attendait une autre donnée.

GitHub avait bien cloné le repository.

Nix fonctionnait.

Mon moteur avait simplement choisi la mauvaise source.

À chaque fois, le problème était assez localisé parce que les responsabilités étaient séparées.

C’est exactement ce que je voulais obtenir.

## Un erase complet reste indispensable, mais ce n’est pas le seul vrai test

Après quelques itérations, j’ai arrêté de considérer un test local comme représentatif.

Supprimer deux fichiers puis relancer l’app n’est pas un test de provisioning.

Pour le chemin ADE, le vrai test reste un Mac effacé, Setup Assistant, un premier login propre, le réseau réel, aucune dépendance héritée de mon environnement de développement et un utilisateur qui ne connaît pas l’implémentation.

Mais l’inverse est vrai aussi.

Je ne veux pas valider uniquement le cas confortable du disque vierge alors que plusieurs machines de l’entreprise existent déjà.

Une machine brownfield est presque un meilleur test de convergence : Homebrew est déjà là, des fichiers utilisateur existent, Nix peut déjà avoir été installé, le hostname a une histoire et je n’ai pas le droit de résoudre un conflit en supprimant simplement ce qui me gêne.

Le système doit donc réussir deux exercices différents.

Sur un Mac neuf, il doit construire proprement le poste depuis zéro.

Sur un Mac existant, il doit comprendre suffisamment ce qu’il trouve pour le faire converger sans casser les données ni prétendre qu’il est passé par ADE alors que ce n’est pas le cas.

Dans les deux cas, je veux finir avec la même chose : un profil identifié, une version connue, un état observable et un chemin de rollback.

C’est là qu’on voit si le système gère réellement des workstations.

Ou s’il ne sait fonctionner que sur la machine de la personne qui l’a écrit.

Pour l’instant, c’est probablement la leçon la plus utile de tout le chantier.

## Sources officielles

- [Apple Business : macOS packages](https://support.apple.com/guide/business/create-a-package-axm8e397e77d/web)
- [Apple Platform Deployment](https://support.apple.com/guide/deployment/welcome/web)
- [Determinate Systems : Deploy Determinate with MDM](https://docs.determinate.systems/guides/mdm/)
- [Nix manual](https://nix.dev/manual/nix/latest/)
