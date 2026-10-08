---
title: "Les tests tournent en local. GitHub garde le dernier mot."
description: "GitHub App, statuts exact-SHA et rulesets : conserver une décision de merge malgré une validation locale."
pubDate: 2026-11-21T07:30:00.000Z
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
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 3/5. Le début : [l’IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Faire tourner les tests sur le Mac ne m’inquiétait pas. Ce que je ne voulais surtout pas, c’était transformer le merge en déclaration sur l’honneur.

Il faut pouvoir travailler vite avec Cursor, mais sans demander à GitHub de croire un simple « tout est vert » tapé dans un terminal.

## Un résultat appartient à un commit

Un test réussi sur A ne vaut pas pour B. Un amend, un rebase ou une correction de dernière minute change le SHA et invalide la preuve précédente.

Notre validation produit donc un JSON associé au SHA exact, avec les contrôles réellement exécutés. Un contrôle léger pre-push n’a pas le droit de se faire passer pour le résultat PR-ready.

~~~text
ci:validate
   -> preuve exact-SHA
   -> push
   -> GitHub App
   -> sanad/devenv-ci
   -> ruleset
   -> merge
~~~

## Pourquoi une GitHub App ?

Je ne voulais pas que la publication du statut repose sur les credentials Git personnels. Une GitHub App dédiée permet de publier sous une identité identifiée et de limiter la source du check exigé par le ruleset.

La difficulté, c’est l’onboarding. Notre publisher lit le Keychain macOS. Le PEM est distribué depuis Azure Key Vault. Un poste peut parfaitement avoir une toolchain fonctionnelle et ne pas posséder encore cette clé : les tests passent, mais le statut ne monte pas.

C’est un lien assez direct avec [la gestion des identités dans notre série Apple Business et Entra](/thinking/2026-10-10-apple-business-entra-identite-workstation/). Préparer le poste, c’est aussi lui donner les bons droits pour qu’il puisse participer à la chaîne de livraison.

## Le push est moins simple qu’il n’en a l’air

GitHub doit connaître le commit avant de recevoir son statut. Il faut donc valider, pousser, puis publier, sans relancer les tests.

Ça implique de traiter les erreurs réseau, les pushes refusés et les modifications concurrentes. Et attendre la fin d’un PID git n’est pas une preuve que le serveur a effectivement accepté le push.

Je préfère garder ce type de scénario dans les tests de clôture plutôt que de faire croire qu’une dizaine de lignes de shell règle le problème.

## Ce que ce statut garantit, et ce qu’il ne garantit pas

L’identité GitHub App permet d’identifier le publisher. Le SHA permet d’identifier la révision. Mais aucun des deux n’atteste que le développeur a honnêtement exécuté tous les tests.

Un poste compromis qui détient la clé App peut potentiellement publier un faux succès. Si le besoin est de résister à un contributeur malveillant, on conserve une validation indépendante, sur une infrastructure contrôlée.

Dans notre cas, nous cherchions surtout à supprimer les oublis, accélérer les boucles de feedback et garder la gouvernance de merge cohérente.

## Suite

4/5 : **Tout tester à chaque changement ? Pas nécessairement.**

## Sources

- [GitHub : commit statuses](https://docs.github.com/en/rest/commits/statuses)
- [GitHub : GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
