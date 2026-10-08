---
title: "Nous avons déplacé la CI sur nos Mac. Pas nos exigences."
description: "Comment devenv, Nix et prek rapprochent les vérifications du code, sans multiplier les outils."
pubDate: 2026-11-14T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - CI/CD
  - AI Engineering
  - Platform Engineering
  - devenv
  - GitHub
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 2/5. Le début : [l’IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

La décision était prise : faire tourner davantage de vérifications en local. Restait à trouver comment le faire sans ajouter un framework de CI maison.

Je voulais quelque chose qu’un développeur puisse comprendre, qu’un agent puisse exécuter et qu’on puisse réparer sans appeler l’auteur du script.

## Le poste n’est plus une collection d’installations manuelles

Avec [Nix et le provisioning macOS](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/), nous avions déjà commencé à traiter le poste comme une plateforme. J’ai aussi expliqué [pourquoi je versionne désormais mes postes comme du logiciel](/thinking/2026-10-24-versionner-postes-semver-nix/).

Nix fournit le socle ; devenv porte les besoins du repository. Les mêmes commandes restent accessibles aux développeurs et aux agents.

~~~bash
devenv shell -- check:commit
devenv shell -- check:push
devenv shell -- ci:validate
~~~

## Je ne voulais pas d’un deuxième gestionnaire de hooks

Nous utilisions déjà prek avec notre socle partagé. Rajouter Husky ou Lefthook aurait seulement créé une seconde façon de gérer des hooks. Nous avons donc gardé ce mécanisme et déplacé la logique dans des scripts versionnés.

Le pre-commit est volontairement court : format, syntaxe, conflits. Le pre-push déclenche la validation PR-ready. Il n’y a aucune raison de démarrer PostgreSQL pour un simple problème de formatage.

## PostgreSQL local, vraiment ?

Oui. Une base de test dans devenv permet de rejouer les migrations, vérifier le schéma et exécuter les tests d’intégration sans attendre un runner distant.

Cela ne rend pas les tests gratuits. La base doit démarrer, les fixtures doivent rester isolées et le développeur doit pouvoir comprendre pourquoi une migration a échoué.

Mais au moins, le feedback arrive pendant qu’on travaille.

## Ce que l’agent peut faire

Cursor peut lancer exactement les mêmes scripts que moi. Je ne veux pas de chemins de validation séparés : un rapide pour l’IA, un sérieux pour l’humain.

Le hook n’est pas l’autorité de merge, en revanche. Il reste contournable. C’est pour ça que GitHub garde son rôle, sujet du prochain épisode.

## Suite

3/5 : les tests tournent en local, GitHub garde le dernier mot.

## Sources

- [devenv Git hooks](https://devenv.sh/git-hooks/)
- [prek](https://prek.j178.dev/)
- [Nix](https://nixos.org/learn/)
