---
title: "L’IA écrit plus vite. Notre CI devait suivre."
description: "Le changement de rythme apporté par Cursor nous a amenés à revoir nos contrôles sans renoncer à la gouvernance."
pubDate: 2026-11-07T07:30:00.000Z
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
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 1/5. Un retour d’expérience sur notre façon de valider le code assisté par IA.

J’ai commencé à utiliser Cursor pour une tâche, puis deux, puis des changements de plus en plus larges. Le code arrive plus vite. Ça ne veut pas dire qu’il est meilleur. Ça veut dire qu’on peut produire en quelques minutes ce qu’on écrivait auparavant en beaucoup plus longtemps.

Et je me suis posé une question assez simple : **est-ce que notre manière de valider les changements suit encore ?**

## Le goulot s’était déplacé

Notre CI historique fonctionnait. GitHub Actions lançait les tests, reconstruisait l’environnement, faisait tourner PostgreSQL et les contrôles statiques. Sauf que, lorsque les agents commencent à itérer rapidement, la boucle devient assez étrange : modifier le code, pousser, attendre qu’un runner démarre, regarder une erreur qu’on aurait pu détecter sur le Mac, recommencer.

Ce n’est pas un reproche à GitHub Actions. Nous lui demandions de faire à distance ce que notre environnement de développement savait déjà faire.

Le coût des runners était un signal supplémentaire, pas le point de départ de la réflexion. Mon problème était de maintenir des contrôles systématiques alors que le rythme des modifications accélérait.

## Un agent IA n’a pas de passe-droit

Un agent peut écrire des tests. Il peut aussi oublier un scénario, exécuter uniquement la partie confortable et annoncer que tout est terminé.

Je ne veux donc pas que la qualité dépende de la qualité du prompt. Les règles doivent vivre dans le repository, hors de la conversation avec l’agent.

Même code, mêmes commandes, mêmes conditions d’intégration, que la modification vienne d’un développeur ou de Cursor.

## Nous avions déjà préparé le terrain

J’ai raconté dans [ma série sur le provisioning Mac](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/) pourquoi nous avions séparé Apple Business, Entra et Nix.

À partir du moment où le poste est reproductible, pourquoi reconstruire une seconde toolchain complète à chaque push ? Nous avons conservé une plateforme de développement versionnée et rapproché les validations de celui qui produit le changement.

~~~mermaid
flowchart LR
    A[Developpeur ou agent] --> B[Checks locaux]
    B --> C[Preuve exact-SHA]
    C --> D[GitHub ruleset]
    D --> E[Merge]
~~~

## Ce que je ne prétends pas

Une validation locale n’est pas une attestation indépendante. Un développeur qui maîtrise entièrement son poste peut potentiellement produire un résultat trompeur. Si le modèle de menace exige une vérification hors du poste, il faut conserver un contrôle distant.

L’objectif était d’accélérer le feedback et de rendre les contrôles difficiles à oublier, pas d’inventer une nouvelle garantie cryptographique.

## Suite

2/5 : nous avons déplacé la CI sur nos Mac, pas nos exigences.

## Sources

- [devenv](https://devenv.sh/)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
