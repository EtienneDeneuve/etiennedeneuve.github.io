---
title: "Développer à la vitesse de l’IA, livrer avec la rigueur de l’ingénierie."
description: "Retour d’expérience sur la CI locale : mesures, onboarding, limites de confiance et continuité du poste à la production."
pubDate: 2026-12-05T07:30:00.000Z
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
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 5/5. Le début : [l’IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Au départ, je voulais éviter d’attendre un runner distant pour découvrir une erreur que mon Mac pouvait déjà voir.

Le chantier a fini par toucher devenv, les hooks Git, PostgreSQL, Rust, les statuts GitHub et les permissions de l’App.

Avec le recul, c’est logique. **Déplacer le calcul oblige à clarifier où se situe la confiance.**

## Ce qui a réellement changé

Les vérifications font désormais partie du développement, avec les mêmes commandes pour nous et pour les agents IA.

GitHub reste l’autorité de merge. Les builds de release et les contrôles qui exigent un environnement indépendant sont un autre sujet.

L’intérêt n’est pas d’avoir supprimé tel fichier YAML. C’est d’avoir séparé trois responsabilités qu’on mélangeait : produire du code, vérifier un changement, autoriser son intégration.

## Les chiffres, mais pas les promesses

Nous avons mesuré les tests unitaires Nova. Le job GitHub Actions historique prenait en moyenne environ 6 min 10 s. Sur un benchmark ciblé, un runner GitHub simplifié prenait 4 min 32 s à froid et 1 min 36 s à chaud ; la commande locale prenait 121,25 s à froid et 38,63 s à chaud.

Ces mesures ne couvrent pas exactement la même enveloppe. Il serait trompeur d’en déduire un gain global de productivité.

Il nous faut également une mesure consolidée des runner-minutes avant et après cutover, sur des périodes comparables, pour annoncer une économie mensuelle vérifiable.

## Le meilleur test, c’est souvent le Mac du collègue

Sur ma machine, tout semblait relativement simple. Sur un nouveau poste, le publisher GitHub App pouvait manquer de credentials dans le Keychain.

Les tests pouvaient être verts, mais GitHub n’avait pas le statut requis pour le merge.

Nous avons documenté un chemin Azure Key Vault, sans considérer que cela ferme automatiquement tous les sujets d’onboarding, de rotation et de gestion des erreurs.

C’est pour cela que je relie cette série à [notre travail sur Apple Business et Nix](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/) et au [versionnement des workstations](/thinking/2026-10-24-versionner-postes-semver-nix/). Un poste de développement n’est pas indépendant de la plateforme qu’il utilise.

## Ce que je ne généraliserais pas

Une CI locale n’a pas toutes les garanties d’un runner distant sous contrôle indépendant. Un statut exact-SHA n’est pas une attestation d’exécution.

Si une organisation exige de résister à un contributeur malveillant ou à un poste compromis, il faut conserver les contrôles hors du poste qui répondent à ce besoin.

Et il reste à éprouver les chemins désagréables : push refusé, coupure réseau, publications concurrentes, rotation des clés. Le fait qu’un script soit mergé ne suffit pas à prouver qu’il est industrialisé.

## Du poste jusqu’à la production

Nous avions commencé par l’identité et l’environnement du Mac. Nous avons ensuite déplacé les contrôles plus près du code. La suite logique, ce sont les artefacts, leur provenance, le déploiement et l’état réellement observé.

L’IA accélère la production des changements. Elle ne dispense pas de construire une plateforme capable de les vérifier et de les livrer proprement.

Je trouve ce sujet nettement plus intéressant que de savoir combien coûte une minute de runner.

## Sources

- [devenv](https://devenv.sh/)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
