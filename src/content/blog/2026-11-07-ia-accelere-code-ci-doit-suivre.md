---
title: "L'IA écrit plus vite. Notre CI devait suivre."
description: "L'accélération du développement assisté par IA nous a amenés à déplacer des validations sur les postes, sans abandonner la gouvernance GitHub."
pubDate: 2026-11-07T07:30:00.000Z
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
  - Platform Engineering
  - Developer Experience
  - GitHub
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-12-12-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l'IA accélère le code, la CI doit suivre**, 1/6. Un retour d'expérience sur notre manière de rapprocher les vérifications du développement, quel que soit l'agent utilisé.

J'ai commencé à voir le problème lorsque les agents de développement ont changé notre manière d'itérer.

Avant, entre deux changements un peu conséquents, il se passait naturellement du temps. On écrivait, on relisait, on corrigeait, puis on poussait. Avec un agent capable de modifier un backend, son frontend et quelques tests dans la même séquence, cette cadence n'a plus beaucoup de sens.

Je ne dis pas que le code est meilleur. Je dis qu'il arrive plus vite.

Et à un moment je me suis demandé : **si la production de code accélère autant, pourquoi attendons-nous toujours la fin du push pour apprendre qu'un typecheck ne passe pas ?**

## Ce n'était pas vraiment un problème de GitHub Actions

Notre CI distante faisait son travail. Elle installait les outils, exécutait les tests, démarrait PostgreSQL, vérifiait les migrations. Le problème venait plutôt de l'endroit où nous avions placé ces vérifications.

Imaginons une modification très banale. Un agent modifie une API et son consommateur frontend. On pousse. Le runner démarre, restaure ses caches, prépare le projet, puis découvre une erreur TypeScript. On revient dans l'éditeur, on corrige et on recommence.

Rien d'anormal dans ce scénario. Sauf que nous avions déjà la même toolchain sur le poste de développement.

À partir de là, chaque aller-retour distant pour une erreur reproductible localement m'a semblé de moins en moins pertinent.

Le coût des runners a rendu la situation visible. Mais je ne voulais pas construire une architecture simplement pour économiser quelques dollars. Je voulais **réduire le temps entre un changement et un résultat de validation fiable**.

## Les agents ont accéléré une tension qui existait déjà

Le problème ne dépend pas de l'assistant utilisé. Qu'il s'agisse d'un agent intégré à l'éditeur, d'un outil en ligne de commande ou d'un système qui prépare des branches de manière autonome, la question reste identique.

Quel contrat doit respecter le code avant d'être proposé à l'intégration ?

Je ne veux pas que ce contrat soit caché dans un prompt. Un agent peut oublier une consigne. Il peut décider qu'un test semble inutile. Il peut même annoncer une tâche terminée parce qu'une petite sous-partie de la suite est verte.

Un humain peut faire exactement les mêmes erreurs, d'ailleurs.

Nous avons donc cherché à rendre la validation indépendante de celui qui produit le changement. Les commandes et les conditions de réussite appartiennent au repository. L'agent n'a pas une CI simplifiée ; le développeur n'a pas un parcours parallèle.

L'IA change la vitesse de production. Elle ne change pas la définition d'un résultat acceptable.

## Nous avions déjà un avantage : les postes étaient traités comme une plateforme

Dans une [première série, j'expliquais pourquoi j'avais arrêté de traiter le provisioning Mac comme un simple problème MDM](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/).

Le découpage était assez clair : Apple Business pour prendre en charge le poste et imposer les prérequis, Entra pour l'identité et les droits, Nix pour construire l'environnement attendu.

J'avais aussi commencé à [versionner les configurations des postes comme du logiciel](/thinking/2026-10-24-versionner-postes-semver-nix/), plutôt que de me contenter d'un ensemble de packages installés à un instant donné.

Ce travail n'avait pas été fait pour la CI. Mais il nous donnait déjà une base : des outils versionnés, des environnements reproductibles et une façon cohérente d'installer ce dont un repository a besoin.

Je me suis donc posé la question inverse de celle qu'on pose habituellement : pourquoi faudrait-il reconstruire systématiquement à distance ce que le poste sait déjà exécuter ?

## Nous avons séparé trois responsabilités

La cible tient en trois étapes.

~~~mermaid
flowchart LR
    A[Code humain ou agent] --> B[Validation locale]
    B --> C[Statut du commit]
    C --> D[Politique de merge GitHub]
    D --> E[Build et livraison]
~~~

Le poste exécute les contrôles qui peuvent être reproduits localement. Une preuve structurée rattache le résultat au commit exact. GitHub conserve le pouvoir de refuser le merge si le statut attendu manque ou échoue.

Les builds d'artefacts et les contrôles qui ont besoin d'une exécution indépendante ne disparaissent pas. Ils ne répondent simplement pas à la même question.

J'aime bien ce découpage parce qu'il évite de confondre la vitesse du feedback avec l'autorisation d'intégrer un changement.

## Ce qu'il serait dangereux de conclure

Il y a une limite importante : **un résultat local n'est pas une attestation indépendante**.

Une toolchain reproductible permet de refaire le calcul. Un statut attaché à un SHA permet de désigner la révision. Mais si une personne contrôle son poste et l'identité qui publie le statut, ces mécanismes ne prouvent pas qu'elle a honnêtement exécuté les tests.

Dans une organisation où le modèle de menace inclut un contributeur malveillant ou un poste compromis, je conserverais les contrôles indépendants nécessaires.

Nous cherchions d'abord à rendre les vérifications systématiques dans notre boucle quotidienne, sans laisser la CI distante devenir le goulot de chaque itération.

Ce n'est pas une révolution de GitHub Actions. C'est une décision sur **où exécuter quoi, et à qui faire confiance pour quel résultat**.

## Suite

Dans le deuxième article, je rentre dans la mise en œuvre : Nix, devenv, hooks Git et PostgreSQL local. Et surtout, pourquoi nous avons volontairement évité de créer une nouvelle plateforme de CI à entretenir.

## Sources

- [devenv : documentation officielle](https://devenv.sh/)
- [GitHub : comprendre les rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
