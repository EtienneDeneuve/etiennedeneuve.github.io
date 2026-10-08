---
title: "CI locale : moins de minutes GitHub, mais quel gain réel ?"
description: "Une première comparaison chiffrée de notre CI locale : minutes de runners, dollars, délai de feedback et indicateurs de qualité, sans inventer un ROI."
pubDate: 2026-11-13T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - CI/CD
  - Developer Experience
  - GitHub Actions
  - Engineering Metrics
  - Platform Engineering
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre
  - 2026-10-16-deplacer-ci-sur-mac-devenv
  - 2026-10-23-github-garde-dernier-mot-ci-locale
  - 2026-10-30-tester-changement-sans-tout-relancer
  - 2026-11-06-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 6/6. Le début : [pourquoi nous avons commencé à déplacer les validations](/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/).

Il y a un truc qu’on fait facilement après avoir modifié une CI : on prend le job qui était lent, on montre que la commande tourne maintenant plus vite sur son Mac, puis on annonce un pourcentage d’amélioration.

J’ai failli faire exactement ça.

Sauf qu’en regardant les chiffres d’un peu plus près, on comparait parfois le temps complet d’un job distant avec le temps d’une seule commande locale. Et le gain financier ne racontait pas du tout la même histoire que le gain de feedback.

Pour finir cette série, je préfère regarder ce que nous avons réellement mesuré, et ce qu’il nous manque encore.

## Nous avions une photographie de départ

Avant de retirer les workflows historiques, nous avons collecté l’activité d’un de nos projets internes, celui sur lequel nous avons déployé cette approche en premier.

La fenêtre d’audit allait du 7 au 25 septembre 2026. Elle contenait **561 exécutions de workflows, 635 jobs et 2 964 minutes de durée cumulée des jobs**.

C’est un premier ordre de grandeur utile. On voit les jobs récurrents, les déclenchements en double, les exécutions annulées, la préparation des outils et les validations réellement exécutées.

Mais 2 964 minutes de jobs ne veulent pas dire 2 964 minutes facturées. La période ne correspond pas à un mois entier, les runners peuvent avoir des tarifs différents et GitHub applique ses propres règles de facturation.

Il aurait été assez facile de multiplier ce nombre par un tarif et d’annoncer une économie. Ça aurait surtout donné un chiffre incorrect.

## Le benchmark intéressant était beaucoup plus petit

Nous avons isolé une commande de tests Go représentative et comparé plusieurs exécutions.

| Exécution | Mesure |
| --- | ---: |
| Ancien job GitHub Actions complet | 6 min 10 s en moyenne, p95 à 9 min 48 s |
| Runner GitHub simplifié, cache froid | 4 min 32 s |
| Runner GitHub simplifié, cache chaud | 1 min 36 s |
| Commande locale, cache froid | 121,25 s |
| Commande locale, cache chaud | 38,63 s |

Ces valeurs viennent de notre audit et des essais ciblés du 2 octobre 2026.

Il faut faire attention à ce qu’on lit. La moyenne historique porte sur le job entier, avec ses préparations et d’autres vérifications. Les essais simplifiés visaient la même commande métier, mais l’environnement, le démarrage et les caches n’étaient pas identiques.

**Ce que je retiens, c’est que la commande choisie donnait un résultat local à chaud en moins de quarante secondes.** Ce n’est pas le temps complet de validation d’une PR, ni une preuve que tous les changements se valident à cette vitesse.

Sur le poste, ces quelques secondes changent quand même la manière d’itérer. On corrige pendant que le contexte est encore frais, plutôt que de revenir sur un problème après un cycle distant.

Mais je veux une mesure de ce comportement sur plusieurs semaines avant d’en tirer une conclusion générale.

## Et en dollars, ça donne quoi ?

C’est là que le sujet devient amusant.

Au 8 octobre 2026, les tarifs publics de GitHub indiquent **0,006 USD par minute pour un runner Linux x64 standard à deux cœurs** et **0,062 USD pour un runner macOS standard**. GitHub arrondit la durée de chaque job à la minute supérieure. Il faut ensuite tenir compte des minutes incluses dans le plan, des autres usages et du stockage.

Un ordre de grandeur : cent PR qui économiseraient chacune dix minutes sur un runner Linux standard représentent **6 USD de consommation brute** avant quotas.

Ce n’est pas une économie observée chez nous. C’est simplement le tarif appliqué à une hypothèse facile à vérifier.

Et, présenté comme ça, on comprend tout de suite que les runners Linux standard ne sont pas nécessairement le meilleur argument économique pour justifier des semaines de travail.

Avec des runners plus coûteux, davantage de jobs ou des workflows qui reconstruisent sans cesse la même chose, la facture peut devenir plus significative. C’est le profil réel des exécutions qui décide, pas la démonstration sur une PR.

Le calcul sérieux doit partir de la consommation *facturable* par type de runner et de la facture GitHub avant et après, sans mélanger les tests PR avec les builds, les previews et les releases qui continuent de tourner.

## Le temps développeur est plus difficile à mesurer

Une minute de CI économisée n’est pas automatiquement une minute de travail humain récupérée.

Pendant qu’un job tourne, un développeur peut relire autre chose. Un agent peut continuer à travailler. À l’inverse, un échec qui arrive trop tard peut casser complètement une session de travail.

Ce que je voudrais mesurer, c’est le temps entre une modification et **le premier résultat exploitable**, puis la part de ce délai pendant laquelle quelqu’un attendait réellement.

Je regarderais la médiane et le p90, pas le meilleur passage avec un cache chaud.

J’aimerais aussi comparer le nombre de corrections qui partent en PR avec une erreur détectable localement. C’est un indicateur plus intéressant qu’un simple nombre de tests exécutés.

Si les erreurs sont corrigées avant le push et que les PR arrivent plus souvent directement dans un état valide, on aura gagné quelque chose dans le flux de travail.

Mais ce gain ne s’exprime pas automatiquement en euros de salaire économisés. Au mieux, on peut parler de capacité retrouvée, à condition de la mesurer sérieusement.

## Les indicateurs que je garderais

Je me limiterais à quelques chiffres que l’équipe peut réellement exploiter.

| Sujet | Mesure à suivre |
| --- | --- |
| Feedback | Médiane et p90 du délai entre changement et premier résultat exploitable |
| Intégration | Délai entre ouverture de PR et état réellement mergeable |
| GitHub Actions | Minutes facturées et coût par type de runner, séparés entre PR, preview et release |
| Qualité | Contrôles requis exécutés par surface et échecs échappant à la validation locale |
| Publisher | Statuts publiés sur le bon SHA, erreurs et délais de publication |
| Onboarding | Temps nécessaire sur un Mac neuf pour produire une PR mergeable |
| Friction | Relances, corrections après push et attentes bloquantes observées |

Il faut également distinguer les types de changements. Une PR de documentation, une migration PostgreSQL et un changement Rust ne devraient pas avoir le même profil de validation.

Je n’agrégerais pas tout ça dans un score unique de « developer productivity ». On perdrait précisément les problèmes qu’on cherche à comprendre.

## La comparaison avant / après n’est pas encore terminée

Nous avons une baseline et quelques benchmarks précis.

Il nous manque une fenêtre post-cutover stabilisée, avec le même périmètre et la même définition des indicateurs. Je prendrais quatre semaines comparables avant et après, en séparant les builds et les tests, puis je vérifierais que le volume et la nature des PR n’ont pas trop changé.

Il faudrait aussi suivre le temps passé à entretenir les environnements locaux. Un Mac qui compile localement consomme des ressources. Les caches prennent de la place, PostgreSQL peut gêner un autre service et l’onboarding demande du support.

La facture GitHub ne raconte pas cette partie-là.

Enfin, je garderais un œil sur les échecs de publication du statut. Une validation rapide qui bloque régulièrement les merges parce que la GitHub App ne publie pas correctement n’a pas amélioré l’expérience.

## Ce que j’en retiens pour le moment

Sur ce premier projet, nous avons démontré qu’une partie des contrôles pouvait revenir sur le poste avec un feedback plus court sur les scénarios mesurés.

Nous avons aussi réduit la dépendance aux workflows distants pour des vérifications répétitives, tout en gardant GitHub comme point de décision avant le merge.

Il reste à consolider les résultats à l’échelle d’un cycle complet et à terminer les cas limites du publisher. Et surtout, nous n’avons pas encore déployé le modèle sur tous nos repositories : c’est la suite du chantier, pas un résultat que l’on peut déjà chiffrer.

Je ne vais donc pas annoncer un ROI global ni une économie mensuelle définitive.

Le plus intéressant, pour moi, est ailleurs : nous avons commencé par vouloir accélérer une boucle de validation et nous avons fini par relier le provisioning du poste, l’environnement projet, le commit testé et sa décision d’intégration.

C’est assez proche de ce que je cherchais déjà en [versionnant nos postes de travail comme du logiciel](/thinking/2026-10-24-versionner-postes-semver-nix/).

Et si la prochaine mesure montre que certaines validations doivent retourner sur un runner distant, ce ne sera pas un échec. On saura au moins pourquoi on les exécute là-bas.

## Sources officielles

- [GitHub : prix des runners Actions](https://docs.github.com/en/billing/reference/actions-runner-pricing)
- [GitHub : facturation GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
