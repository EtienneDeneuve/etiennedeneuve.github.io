---
title: "Nous avons déplacé la CI sur nos Mac. Pas nos exigences."
description: "Nix, devenv, prek et PostgreSQL local pour rapprocher les vérifications du code, sans entretenir deux chaînes techniques contradictoires."
pubDate: 2026-10-16T07:30:00.000Z
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
  - 2026-10-09-ia-accelere-code-ci-doit-suivre
  - 2026-10-23-github-garde-dernier-mot-ci-locale
  - 2026-10-30-tester-changement-sans-tout-relancer
  - 2026-11-06-retour-experience-ci-locale-ia
  - 2026-11-13-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 2/6. Le début : [pourquoi nous avons commencé à déplacer les validations](/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/).

Faire tourner les tests sur un Mac, ce n’est pas compliqué.

Faire en sorte qu’un autre développeur, sur un Mac fraîchement installé, obtienne le même résultat sans passer une journée à réparer son environnement, c’est une autre histoire.

Je voulais éviter le classique « chez moi ça marche », appliqué cette fois à la CI.

## Le poste savait déjà presque tout faire

J’ai parlé dans [la série sur Apple Business, Entra et Nix](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/) de notre choix de ne pas faire porter tout le provisioning au MDM.

Apple Business s’occupe de l’enrôlement et des prérequis. Entra donne une identité et des droits. Nix compose le poste.

Sur le projet interne qui nous a servi de pilote, nous avions déjà devenv. Il décrit la toolchain, les services et les commandes nécessaires dans le repository. L’environnement de travail ne dépend donc pas d’une petite checklist que chacun suivrait plus ou moins bien.

Ce n’est pas nouveau. Le changement, c’est d’avoir décidé que cet environnement pouvait aussi porter une grande partie des validations.

~~~text
Nix sur le Mac
  -> outils du poste

devenv dans le repository
  -> outils et services du projet

scripts de validation versionnés
  -> ce qu'on vérifie réellement
~~~

Je préfère que ces responsabilités soient séparées. Quand un outil manque, on sait où le déclarer. Quand un test est incorrect, ce n’est pas le provisioning du Mac qu’il faut modifier.

## Pourquoi je n’ai pas ajouté un nouveau système de hooks

Nous avions déjà prek, intégré à notre outillage commun.

J’aurais pu ajouter Husky ou Lefthook au repository et y écrire toute la logique de contrôle. Ça aurait sans doute fonctionné. Mais nous aurions eu deux façons d’installer des hooks et plusieurs endroits où chercher lorsqu’ils ne tournent plus.

Nous avons gardé prek et des scripts Bash versionnés, utilisables sans Git.

~~~bash
devenv shell -- check:commit
devenv shell -- check:push
devenv shell -- ci:validate
~~~

Il y a volontairement trois commandes.

\`check:commit\` doit rester presque instantané. Il détecte les conflits laissés dans les fichiers, les erreurs de format et quelques problèmes de syntaxe. Pas de base PostgreSQL, pas de compilation complète.

\`check:push\` est un contrôle plus large qu’on peut lancer à la main. Il reste distinct de la validation complète.

\`ci:validate\` correspond à la validation PR-ready. C’est elle qui doit produire le résultat publiable pour le commit testé. Le hook pre-push peut l’appeler lors d’un \`git push\`, mais on peut aussi l’exécuter explicitement pour diagnostiquer un échec.

Ça évite un piège assez bête : considérer que parce que le formatage est passé, le changement est prêt à merger.

## Une vraie base de données locale

La partie la plus utile à ramener sur les postes a été PostgreSQL.

Sur notre projet, il ne suffisait pas de compiler le code Go. Nous avions besoin de vérifier les migrations, la compatibilité des requêtes et les tests d’intégration avec une base.

devenv sait démarrer le service. Ensuite, les scripts attendent qu’il soit prêt et préparent des bases de test isolées.

Quelques détails qui comptent davantage que le diagramme : repartir d’une base vide avant un replay, ne pas laisser une fixture polluer les tests suivants, faire échouer la validation lorsque PostgreSQL est absent plutôt que sauter silencieusement l’intégration.

Nous avons également ajouté des contrôles d’upgrade sur une base peuplée. Une migration qui marche dans une base vierge n’est pas forcément capable de passer sur une base utilisée depuis deux ans.

C’est le genre de sujet que j’ai davantage envie de découvrir avant de pousser qu’après avoir déployé.

## Il fallait aussi penser aux agents

Le choix de scripts versionnés a été assez pratique de ce côté-là.

Un agent capable de lancer des commandes, depuis un IDE ou un terminal, peut exécuter les mêmes validations qu’un développeur. Il lit le résultat, corrige et relance.

Je ne lui ai pas créé une commande « agent-ci » avec une suite plus courte et trois exceptions.

Et les hooks restent utiles même lorsque l’agent oublie les tests. Ils ne remplacent pas la politique de merge, mais ils rendent le chemin habituel plus difficile à oublier.

Sur un dépôt dont les commits arrivent souvent, c’est un détail qui finit par compter.

## Le Mac ne devient pas un runner GitHub

C’est une différence que je voulais garder très nette.

Les postes ne sont pas inscrits comme runners self-hosted. GitHub ne les utilise pas pour exécuter arbitrairement les jobs du repository. Les validations sont déclenchées localement, dans le contexte du développeur, avec les outils du projet.

Nous n’avons donc pas créé de ferme CI à exploiter, ni de dépendance à un contrôleur supplémentaire.

C’est aussi ce qui nous intéresse pour la suite. Le dispositif tourne aujourd’hui sur un projet interne ; le socle Nix, devenv et les hooks doit pouvoir être repris sur les autres repositories, chacun avec ses propres suites. On n’a pas encore fait cette généralisation.

Et je n’essaie pas de faire croire qu’un résultat macOS remplace tous les tests Linux. S’il faut valider une propriété spécifique au runtime Linux, construire une image ou signer un artefact dans un environnement contrôlé, le calcul reste à faire ailleurs.

## Le test qui manque toujours au premier passage

Un développeur qui a installé tous les outils depuis des mois est un assez mauvais test de reproductibilité.

Je veux voir ce que ça donne sur un Mac neuf : devenv entre-t-il correctement ? Le service PostgreSQL démarre-t-il ? Les hooks sont-ils présents ? Les erreurs indiquent-elles comment réparer l’environnement ?

Et, comme nous l’avons découvert ensuite, il faut aller encore un peu plus loin : réussir les tests ne suffit pas si le poste ne possède pas l’identité nécessaire pour publier le résultat sur GitHub.

Je reviens sur cette partie dans le prochain article. Elle est moins confortable que \`devenv shell\`, mais beaucoup plus intéressante pour comprendre où se situe la confiance.

## Sources officielles

- [devenv : Git hooks](https://devenv.sh/git-hooks/)
- [Nix](https://nixos.org/learn/)
- [prek](https://prek.j178.dev/)
