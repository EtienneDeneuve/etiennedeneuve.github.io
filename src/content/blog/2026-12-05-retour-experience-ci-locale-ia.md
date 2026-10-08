---
title: "Développer à la vitesse de l'IA, livrer avec la rigueur de l'ingénierie."
description: "Retour d'expérience sur le déplacement des validations en local : onboarding, statuts GitHub, confiance, cutover et erreurs que je chercherais à éviter."
pubDate: 2026-12-05T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - AI Engineering
  - CI/CD
  - GitHub
  - Nix
  - Platform Engineering
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-12-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l'IA accélère le code, la CI doit suivre**, 5/6. Le début : [l'IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Quand nous avons commencé, je pensais surtout résoudre un problème de feedback : nous écrivions du code plus vite, notamment avec les agents IA, et une partie des vérifications attendait encore le démarrage d'un runner distant.

Nous avons fini par toucher les hooks, la gestion des environnements, PostgreSQL, la publication de statuts GitHub, les droits des applications et le cycle de release.

Avec le recul, ce n'est pas très surprenant.

**Déplacer le calcul ne suffit pas. Il faut aussi déplacer les habitudes, sans déplacer le problème sur le poste de quelqu'un d'autre.**

## La première réussite : ne plus attendre un push pour apprendre

Le résultat le plus visible, ce n'est pas un nombre de workflows supprimés.

C'est la possibilité de lancer les contrôles dans l'environnement où le changement vient d'être produit.

Un agent modifie une requête SQL : on vérifie le contrat de la base. Un développeur corrige une erreur de type : le typecheck peut répondre avant qu'il ouvre une PR.

Les scripts sont dans le repository. Je peux les lire, les lancer et les reproduire. Et lorsqu'une validation échoue, il n'est plus nécessaire de commencer par télécharger un log d'un runner extérieur.

Ce n'est pas forcément spectaculaire sur un diagramme d'architecture. C'est en revanche une différence très concrète dans la manière de travailler.

## Nous avons sous-estimé le rôle du poste

La partie devenv fonctionnait sur une machine déjà configurée.

Puis un collègue arrive avec un Mac neuf.

L'environnement Nix démarre, les outils sont présents, les tests passent... mais le statut GitHub n'est pas publié parce que le publisher ne trouve pas ses credentials dans Keychain.

La machine est prête à compiler, pas encore prête à participer à tout le workflow de contribution.

C'est une distinction que j'avais déjà rencontrée pendant [le provisioning Apple Business / Entra / Nix](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/). Un poste enrôlé n'est pas forcément un poste opérationnel. Un poste qui possède les outils n'a pas nécessairement les droits.

Nous avons documenté la récupération des credentials depuis Azure Key Vault. Il reste à rendre l'approvisionnement et la rotation plus simples à exécuter et à vérifier.

J'aurais dû inclure un poste vierge dans la matrice de validation dès le début.

## Une publication de statut est une petite machine à états

Autre découverte assez prévisible : on se rend vite compte que le push ne se résume pas à « l'appel Git est terminé ».

Le commit doit exister sur GitHub avant d'y publier un statut. Si le push est rejeté, le publisher doit le savoir. Si le réseau est coupé, il faut pouvoir réessayer sans recalculer tous les tests.

Et si deux révisions sont poussées rapidement, on ne veut pas que le résultat de la première soit publié sur la seconde.

Je préfère un statut manquant, qui bloque le merge, à un succès publié sur le mauvais commit.

Notre implémentation a progressé sur cette séparation calcul/publication, mais les cas de push refusé, de concurrence et d'erreur réseau méritent encore une campagne de validation dédiée avant de déclarer le mécanisme industrialisé.

Ce sont ces scénarios qui décident de la solidité du modèle, pas la jolie démonstration où tout fonctionne au premier essai.

## La confiance ne se déplace pas aussi facilement que les tests

Nous avons gardé GitHub comme autorité de merge, avec un statut lié au SHA exact et une identité dédiée pour la publication.

C'est utile pour structurer la gouvernance.

Mais il faut conserver une distinction que je trouve souvent absente des discussions sur la CI locale : **un statut ne prouve pas à lui seul l'exécution des tests**.

Si la clé de publication existe sur le poste et que quelqu'un contrôle ce poste, cette personne peut potentiellement produire un résultat trompeur.

Cela ne veut pas dire que la CI locale n'a pas de valeur. Cela veut dire qu'elle répond à un modèle de confiance précis. Pour des exigences de séparation indépendante ou des artefacts sensibles, il faut conserver les contrôles distants nécessaires.

Je préfère une architecture dont cette limite est assumée à un discours « zero trust » qui oublie le développeur, sa machine et son accès au publisher.

## Un autre piège : déclarer le cutover terminé trop tôt

Déplacer les tests avant de supprimer les anciens workflows est plutôt sain.

On peut comparer les deux chemins, observer les divergences, vérifier que les suites sont équivalentes et seulement ensuite retirer les jobs devenus redondants.

Mais cette phase de transition a tendance à durer si elle n'est pas pilotée. On risque alors de cumuler les coûts des deux systèmes sans obtenir les bénéfices attendus.

Nous avons dû consolider les contrôles locaux, ajuster les déclencheurs par surface et nettoyer progressivement les workflows historiques.

Ce n'est pas parce que quelques PR passent que toutes les propriétés de l'ancien dispositif sont couvertes. Les cas limites, l'onboarding et la mesure réelle du coût doivent faire partie des critères de clôture.

## Ce que je referais dans un autre projet

Je commencerais par définir le contrat de validation : quels contrôles sont requis avant un merge, lesquels sont spécifiques à une release, et lesquels doivent s'exécuter dans un environnement indépendant.

Ensuite, je chercherais à reproduire ces contrôles localement avec les outils déjà présents, sans ajouter immédiatement un orchestrateur.

Je définirais aussi dès le début une matrice d'échec : code cassé, service absent, SHA modifié, push rejeté, publication impossible, credentials manquants, poste neuf.

Et surtout, je mesurerais la baseline avant de toucher aux workflows : runner-minutes, temps de feedback, nombre de tentatives et temps de travail réellement perdu.

Sans baseline, il est beaucoup trop facile de raconter après coup que le nouveau système est meilleur.

## Du poste à la production

Ce projet complète [notre travail sur les workstations versionnées](/thinking/2026-10-24-versionner-postes-semver-nix/).

Il y a une continuité assez naturelle : identité, environnement reproductible, validation du code, décision d'intégration, artefact livré et état réellement observé.

L'IA ne change pas ces responsabilités. Elle accélère simplement le rythme auquel leurs défauts deviennent visibles.

## Suite

6/6 : **Moins de runners, quel gain réel ? Mesurer la CI locale.**

Je vais séparer ce que nous avons effectivement mesuré de ce qu'il reste à mesurer, puis regarder les dollars, le délai de feedback et l'expérience développeur. Sans transformer un benchmark sur une seule commande en un ROI d'entreprise.

## Sources

- [devenv : documentation](https://devenv.sh/)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
