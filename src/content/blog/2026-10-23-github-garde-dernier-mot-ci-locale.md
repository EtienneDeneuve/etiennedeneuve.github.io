---
title: "Les tests tournent en local. GitHub garde le dernier mot."
description: "Un contrôle local doit rester lié au commit exact et être soumis à la gouvernance GitHub. Ce que garantit réellement ce modèle, et ses limites."
pubDate: 2026-10-23T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: software-supply-chain
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - GitHub
  - GitHub App
  - CI/CD
  - Software Supply Chain
  - Platform Engineering
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre
  - 2026-10-16-deplacer-ci-sur-mac-devenv
  - 2026-10-30-tester-changement-sans-tout-relancer
  - 2026-11-06-retour-experience-ci-locale-ia
  - 2026-11-13-mesurer-impact-ci-locale
  - 2026-10-10-apple-business-entra-identite-workstation
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 3/6. Le début : [pourquoi nous avons commencé à déplacer les validations](/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/).

Une fois les tests revenus sur les Mac, il restait une question un peu gênante.

Sur GitHub, qu’est-ce qui empêche quelqu’un de merger une PR alors qu’il n’a rien validé ?

Je ne voulais pas remplacer un workflow qui lançait des tests par un message dans la description de la PR disant « ça passe chez moi ». Même si le message vient d’un agent avec beaucoup d’assurance.

L’idée était de garder les règles GitHub, sans lui demander de recalculer systématiquement tout ce que le poste vient de vérifier.

## D’abord, arrêter de parler d’un résultat sans parler du commit

J’ai commencé par le SHA.

Supposons que les tests passent sur un commit A. L’agent corrige un détail, fait un nouveau commit B et pousse. Si la validation de A reste valable pour B, il y a un trou dans le modèle.

La commande de validation écrit donc un résultat local qui indique le commit testé, les contrôles effectués et le niveau de validation. Un pre-commit qui vérifie trois fichiers ne produit pas la même preuve qu’une validation PR-ready avec PostgreSQL et les tests d’intégration.

La preuve produite par la validation locale doit porter la révision testée et le niveau de vérification atteint. Une passe rapide de formatage et une validation complète avec PostgreSQL ne sont pas interchangeables. Ce contrat est vérifié avant de publier un statut de merge.

Après un amend ou un rebase, le SHA change. Le résultat précédent ne convient plus. La validation doit être rejouée sur la nouvelle révision.

## GitHub n’a pas besoin de lancer le test pour bloquer le merge

Nous avons utilisé une GitHub App pour publier un commit status et un ruleset qui exige ce contexte.

Sur une PR de notre projet interne pilote, on voit les deux contrôles locaux marqués `Required`, avec un statut vert sur le commit exact. GitHub affiche ensuite le bouton de merge. C’est ce fonctionnement que nous voulons retrouver, à terme, sur l’ensemble de nos repositories. Pas besoin de montrer le script du publisher pour expliquer ce qui se passe.

<!-- IMAGE À INTÉGRER APRÈS IMPORT DES ASSETS ANONYMISÉS :
     Fichier préparé : ci-required-checks-anonymized.webp
     Alt : « GitHub : validation locale et E2E exact-SHA requis, PR prête à merger »
     Légende : « Deux contrôles produits en local, deux checks requis sur GitHub. »
     Les noms internes sont masqués ; ne pas ajouter la capture originale au dépôt public.
-->

La capture démontre que la politique de merge existe et fonctionne sur cette PR. Elle ne prouve pas, à elle seule, la réalité de l'exécution locale.

J’ai préféré une App dédiée plutôt que de faire publier les résultats avec les credentials Git personnels. Ça permet de limiter la source du statut autorisée par le ruleset.

Cela suppose évidemment de vérifier aussi les bypass. Une règle qu’on peut contourner avec les bons privilèges reste une règle contournable. Autant savoir précisément par qui.

## Le pre-push arrive trop tôt

C’est le détail qui nous a occupés davantage que prévu.

Quand le hook pre-push démarre, Git n’a pas encore envoyé le commit. Si le publisher interroge l’API GitHub à ce moment-là, la révision peut ne pas exister côté distant.

Le flux devient donc : validation, push, puis publication du statut une fois le commit disponible.

Sauf qu’un push peut être rejeté. Il peut se terminer pendant une coupure réseau. Deux pushes peuvent également se suivre rapidement.

Nous avons séparé le calcul de la publication pour ne pas avoir à relancer toute la suite en cas d’échec réseau. Il faut ensuite que le publisher vérifie la révision réellement disponible sur le dépôt distant, et pas uniquement que le processus Git s’est arrêté.

C’est une partie que je n’ai pas envie de déclarer terminée simplement parce que trois pushes se sont bien passés. Les cas d’échec et de concurrence sont précisément ceux qu’il faut rejouer.

Le bon comportement en cas de doute est assez simple : pas de statut de succès, donc pas de merge par le chemin normal.

## Une nouvelle machine peut tester, mais pas publier

Sur un Mac que j’utilise depuis des mois, les credentials nécessaires sont déjà là.

Sur un poste fraîchement installé, c’est une autre histoire. Nous avons eu le cas d’une validation locale correcte, suivie d’une publication impossible parce qu’il manquait les éléments de la GitHub App dans le Keychain.

Sur nos postes, cette publication repose sur une identité dédiée dont l’accès doit être provisionné et maintenu. Un nouveau Mac capable de compiler n’a pas nécessairement encore les droits pour publier le statut. La rotation des accès fait donc aussi partie du sujet.

C’est exactement le lien avec [la séparation identité / poste de ma série Entra](/thinking/2026-10-10-apple-business-entra-identite-workstation/). Avoir un environnement prêt ne veut pas dire que le poste dispose automatiquement de tous les droits nécessaires.

Le message d’erreur doit permettre de faire la différence entre un test qui échoue et un statut qui ne peut pas être publié.

## Et il y a une limite qu’il faut assumer

Le fait que le status vienne d’une GitHub App ne prouve pas que le Mac a réellement exécuté les tests.

L’App identifie celui qui publie. Le SHA indique le commit visé. Avec une clé de publication distribuée sur les postes, quelqu’un qui contrôle entièrement l’une de ces machines peut potentiellement fabriquer un résultat.

Gérer les accès à cette identité ne transforme pas le Mac en runner attesté.

Pour une équipe dont le modèle de menace impose de résister à un contributeur malveillant, je garderais une validation indépendante sur les changements concernés. Même chose pour un build dont la provenance doit être attestée.

Ce choix a donc ses limites. Il me convient davantage qu’une architecture qui promettrait du « zero trust » tout en donnant une clé de publication à chaque laptop sans en parler.

Sur ce premier projet, nous avons pu faire fonctionner cette séparation entre validation locale et décision GitHub. Il reste à l’adapter aux autres dépôts, avec leurs exigences de sécurité et leurs contrôles propres. Le déploiement à l’échelle de nos repositories est encore devant nous.

Il restait encore à éviter de lancer toute la suite sur chaque changement. C’est le sujet du quatrième article.

## Sources officielles

- [GitHub : commit statuses](https://docs.github.com/en/rest/commits/statuses)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub : GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
