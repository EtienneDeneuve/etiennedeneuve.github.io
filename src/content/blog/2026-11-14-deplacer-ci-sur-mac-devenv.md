---
title: "Nous avons déplacé la CI sur nos Mac. Pas nos exigences."
description: "Nix, devenv, prek et PostgreSQL local pour rapprocher les vérifications du code, sans entretenir deux chaînes techniques contradictoires."
pubDate: 2026-11-14T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - Nix
  - devenv
  - CI/CD
  - macOS
  - Developer Experience
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-12-12-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l'IA accélère le code, la CI doit suivre**, 2/6. Le début : [l'IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Dans le premier article, j'expliquais pourquoi l'accélération du développement assisté par IA nous avait amenés à déplacer une partie des validations.

Sur le papier, c'est assez simple : on lance les tests avant de pousser. En pratique, si chaque développeur doit installer douze outils, récupérer trois variables d'environnement et se souvenir de six commandes, on vient simplement de déplacer le problème.

Je ne voulais pas d'une CI locale qui fonctionne uniquement sur mon Mac.

## La bonne abstraction n'était pas un nouveau runner

Nous avions déjà travaillé sur [le provisioning des Mac avec Apple Business, Entra et Nix](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/). Je racontais aussi [pourquoi je versionne les postes comme du logiciel](/thinking/2026-10-24-versionner-postes-semver-nix/).

La distinction importante : le poste fournit un environnement de travail conforme, mais il ne connaît pas les dépendances de chaque application.

Le repository doit rester responsable de son propre contrat technique : version de Go, environnement JavaScript, outils SQL, PostgreSQL, binaires de lint, scripts de vérification.

C'est là que devenv devient intéressant. Nix fournit des dépendances reproductibles ; devenv assemble les services et les commandes nécessaires au projet.

Le modèle reste lisible :

~~~text
Apple Business / Entra / Nix
    -> poste prêt à travailler

repository + devenv
    -> toolchain et services du projet

scripts versionnés
    -> règles de validation

GitHub
    -> décision d'intégration
~~~

Aucun de ces éléments ne devrait avoir à deviner le travail des autres.

## Je ne voulais pas trois gestionnaires de hooks

Nous utilisions déjà prek avec notre outillage commun.

Ajouter Husky ou Lefthook uniquement pour vérifier quelques fichiers aurait été facile. Mais il aurait ensuite fallu expliquer quel outil installe les hooks, lequel les répare et lequel gagne lorsqu'ils se contredisent.

Nous avons gardé un seul mécanisme et mis les véritables contrôles dans des scripts du repository.

~~~bash
devenv shell -- check:commit
devenv shell -- check:push
devenv shell -- ci:validate
~~~

Un point important : ces commandes sont des interfaces explicites. Je peux les lancer depuis mon terminal. Un agent peut appeler les mêmes commandes. Et si un hook échoue, je peux reproduire le problème sans simuler un commit Git.

Le hook sert à ne pas oublier. Il ne doit pas cacher la logique.

## Tous les contrôles n'ont pas besoin du même rythme

J'ai séparé deux familles.

Le pre-commit doit répondre rapidement. On y met les marqueurs de conflit, la syntaxe, le formatage et quelques gardes statiques à faible coût. Je n'ai aucune envie de démarrer PostgreSQL parce que quelqu'un vient d'éditer un commentaire.

La validation PR-ready peut être plus exigeante. Elle exécute, selon les surfaces affectées, les tests Go, le typecheck du frontend, les gardes de migrations, les tests d'intégration ou les tests Rust.

Un troisième niveau existe pour les parcours bout en bout avant release.

~~~mermaid
flowchart TD
    A[Modification] --> B[Pre-commit rapide]
    B --> C[Validation PR-ready]
    C --> D[Merge autorisé par GitHub]
    D --> E[Validation pré-release]
    E --> F[Build et livraison]
~~~

Ces étapes ne sont pas interchangeables. Une sortie verte de \`check:commit\` ne doit pas pouvoir être publiée comme preuve que \`ci:validate\` est passé.

## Un vrai service PostgreSQL sur le poste

La partie la moins évidente était l'intégration.

Dans un de nos repositories, il faut tester le backend contre une vraie base PostgreSQL. Nous avons donc intégré le service dans l'environnement local plutôt que de conserver un runner distant uniquement pour obtenir une base temporaire.

Cela implique des choses très concrètes : choisir un port stable, attendre que le service réponde, utiliser des bases dédiées, rejouer les migrations, isoler les fixtures et repartir d'un état connu.

J'ai aussi voulu séparer les migrations sur base vide du chemin d'upgrade sur base peuplée. Ce n'est pas le même test.

Le choix n'est pas gratuit. Les Mac doivent avoir assez de mémoire, le service doit pouvoir démarrer et les messages d'erreur doivent expliquer quoi réparer. Mais les développeurs voient les problèmes d'intégration avant de pousser, et pas dix minutes après.

## Où intervient l'agent IA ?

N'importe quel agent capable d'exécuter des commandes dans le repository peut utiliser ce contrat : outil de terminal, extension d'éditeur ou agent lancé dans un environnement automatisé.

Je ne lui demande pas de connaître notre CI par magie. Je lui donne une interface stable, versionnée et documentée.

Par exemple, après avoir changé une migration, il peut lancer \`ci:validate\` et lire une erreur de compatibilité SQL. Il corrige, relance, puis propose la modification.

Ce que je ne veux pas, c'est un agent qui fabrique un script alternatif pour aller plus vite, puis conclut « terminé » après avoir exécuté seulement la moitié des vérifications.

Le garde-fou Git et la politique de merge restent donc nécessaires, y compris lorsque l'agent travaille sans nous demander confirmation à chaque étape.

## Reproductible ne veut pas dire identique partout

Notre environnement de développement est principalement macOS. Cela ne reproduit pas nécessairement une compilation Linux, un comportement spécifique de conteneur ou une signature d'artefact en environnement contrôlé.

Je ne chercherais pas à faire passer un test macOS pour une garantie Linux. Les contrôles natifs et la chaîne de build peuvent conserver une exécution indépendante lorsque la propriété vérifiée l'exige.

Le bon découpage n'est pas « tout en local ». C'est **tout ce qui gagne à être vérifié localement, sans faire disparaître les garanties nécessaires ailleurs**.

## Le test le plus utile : un poste neuf

Une CI locale qui fonctionne sur la machine de l'architecte ne vaut pas grand-chose.

Il faut vérifier un poste nouvellement provisionné, une entrée dans devenv à froid, une base PostgreSQL absente, un hook à réinstaller et une erreur réseau au moment de la publication.

C'est aussi pour cela que le travail MDM et Nix était directement lié à ce chantier : la fiabilité des contrôles commence par celle de l'environnement qui les exécute.

## Suite

3/6 : **Les tests tournent en local. GitHub garde le dernier mot.** On passe de l'exécution à la confiance : quel commit a été testé, qui publie le statut et quelles garanties GitHub peut réellement apporter.

## Sources

- [devenv : Git hooks](https://devenv.sh/git-hooks/)
- [Nix : documentation](https://nixos.org/learn/)
- [prek : documentation](https://prek.j178.dev/)
