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

> Série **Quand l’IA accélère le code, la CI doit suivre**, 5/6. Le début : [pourquoi nous avons commencé à déplacer les validations](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Le schéma était assez propre.

Un Mac préparé avec Nix, devenv pour l’environnement du projet, quelques scripts de validation, un résultat attaché au SHA et GitHub qui continue de décider du merge.

Puis on a commencé à le faire utiliser ailleurs que sur la machine qui avait servi à le concevoir.

C’est là que les détails sont devenus intéressants.

## Tout fonctionnait, sauf le statut GitHub

Sur un des nouveaux Macs, devenv se lançait, les outils étaient présents et la validation locale passait.

Mais le required check n’apparaissait pas sur la PR.

Le problème n’était ni PostgreSQL, ni Go, ni un hook mal installé. Le publisher ne trouvait pas les credentials de la GitHub App dans le Keychain.

C’est assez typique de ce genre de chantier : on pense avoir réglé l’environnement de développement, puis on découvre qu’il manque une pièce du parcours complet.

Nous avons documenté l’onboarding de l’identité de publication. Mais un poste neuf qui doit encore passer par une procédure manuelle pour pouvoir merger sa première PR, ce n’est pas terminé.

À terme, je veux que ce parcours puisse être repris et diagnostiqué proprement, y compris lors d’une rotation de clé.

C’est pour cette raison que je relie cette série au [provisioning macOS avec Apple Business et Entra](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/).

La machine était capable d’exécuter les outils attendus. Elle n’était pas encore prête à publier le résultat et à rendre une PR mergeable.

Sur le moment, c’est plutôt agaçant. Après coup, ça montre bien que « poste prêt » est une définition plus exigeante qu’« installation terminée ».

## Le hook pre-push ne peut pas connaître l’avenir

Autre point qui paraît évident une fois qu’on l’a rencontré : le hook se déclenche avant la fin du push.

Nous avions besoin de publier le résultat une fois le commit réellement présent sur GitHub. La validation locale, elle, pouvait avoir pris plusieurs dizaines de secondes ou quelques minutes. Je n’avais pas envie de la rejouer parce qu’un appel API avait échoué.

Nous avons donc séparé les deux opérations : calcul local d’un côté, publication du statut de l’autre.

Ça règle une partie du problème. Mais pas tous les cas désagréables.

Que se passe-t-il si le remote refuse le push ? Si le réseau disparaît pendant la publication ? Si un amend a changé le SHA entre deux tentatives ? Si deux pushes arrivent rapidement ?

Un processus qui s’est arrêté n’est pas nécessairement un push réussi. Et un statut publié après coup doit toujours viser la bonne révision.

Ces scénarios restent des points que je veux voir testés de bout en bout avant de considérer cette partie comme définitivement industrialisée.

Je préfère qu’une publication échoue clairement et bloque le merge plutôt qu’elle déclare un succès douteux.

## La transition a aussi son coût

Pendant un moment, nous avions à la fois les validations locales et les anciens workflows GitHub Actions.

C’est volontaire : pour retirer un job, je veux d’abord vérifier que son équivalent local couvre réellement les mêmes propriétés.

Le piège, c’est que deux jobs verts ne prouvent pas qu’ils ont fait le même travail.

Nous avons retrouvé des écarts entre les contrôles distants historiques et certaines premières versions des scripts locaux. Il a fallu réconcilier les commandes, les tests et les cas où ils se déclenchent.

C’est beaucoup plus facile à corriger lorsque l’ancien job existe encore.

En revanche, cette phase « en parallèle » ne doit pas devenir un état permanent. Sinon on paie les exécutions distantes tout en exécutant les mêmes validations sur les Macs.

Nous avons donc retiré progressivement les jobs redondants, tout en conservant ceux dont l’exécution distante apporte une vraie garantie. Le contrôle E2E, lui, est maintenant un statut requis sur les PR, exécuté localement lorsque le changement le nécessite.

Je garde aussi une réserve sur la clôture du chantier : les derniers écarts du cutover, les scénarios du publisher et la mesure du résultat global doivent être validés avant d’afficher « terminé » partout.

## Le problème n’est pas de faire confiance à un fichier JSON

Nous avons parlé dans [l’épisode précédent sur GitHub](/thinking/2026-11-21-github-garde-dernier-mot-ci-locale/) de la limite de confiance d’un statut produit depuis le poste.

Je ne vais pas refaire tout le sujet ici. Le point que je retiens, c’est qu’il faut documenter cette limite dans l’architecture et ne pas laisser le mot « required » créer un faux sentiment d’attestation.

Pour des contributions internes dans un périmètre de confiance défini, le modèle peut être un compromis utile. Pour des contributions non fiables ou des exigences fortes de séparation, il faudra garder un contrôle indépendant.

Le fait d’utiliser une GitHub App ne change pas cette réalité.

## Ce que je ferais plus tôt la prochaine fois

J’ajouterais un Mac neuf dans les premiers tests, pas dans les derniers.

Je vérifierais ensuite quelques scénarios simples : contrôle en échec, base PostgreSQL absente, SHA modifié, push rejeté, publication impossible et rotation des credentials.

Je commencerais aussi par une cartographie précise des tests déjà exécutés dans les workflows distants. Pas seulement leurs noms : les vraies commandes et les propriétés vérifiées.

Et je prendrais une photographie des coûts et des temps de feedback avant toute modification.

C’est moins visible qu’un nouveau pipeline. Mais sans ça, il devient vite compliqué de savoir si la migration a réellement amélioré quelque chose.

## Du poste au code, puis à la livraison

J’avais commencé par [versionner les workstations comme du logiciel](/thinking/2026-10-24-versionner-postes-semver-nix/) pour savoir ce qui tourne réellement sur chaque Mac.

On retrouve un peu le même problème ici : nous voulons savoir quel commit a été vérifié, par quels contrôles, avant quelle intégration, puis quel artefact est livré.

L’accélération liée aux agents IA rend ces questions plus fréquentes. Elle n’a pas changé leur nature.

Il me reste une question importante : est-ce que la nouvelle façon de travailler apporte un bénéfice mesurable au-delà du confort dans le terminal ?

J’ai gardé ça pour le dernier article. Avec les chiffres qu’on a, ceux qui nous manquent et les comparaisons que je refuse de faire.

## Sources officielles

- [devenv](https://devenv.sh/)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
