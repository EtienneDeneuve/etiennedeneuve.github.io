---
title: "CI locale : moins de minutes GitHub, mais quel gain réel ?"
description: "Une première comparaison chiffrée de notre CI locale : minutes de runners, dollars, délai de feedback et indicateurs de qualité, sans inventer un ROI."
pubDate: 2026-12-12T07:30:00.000Z
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
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l'IA accélère le code, la CI doit suivre**, 6/6. Le début : [pourquoi nous avons rapproché la CI du développement](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/). Cet épisode sépare les mesures observées des scénarios économiques.

Dans les cinq premiers articles, j'ai expliqué pourquoi nous avions rapproché les contrôles du développement assisté par IA, comment nous avions utilisé Nix et devenv, puis comment GitHub restait le point de contrôle avant le merge.

Reste une question assez normale lorsqu'on décide de changer une chaîne d'ingénierie : **est-ce que tout ça améliore vraiment quelque chose ?**

Pas sur un schéma. Pas parce qu'un script s'exécute plus vite dans un terminal. Dans les chiffres, sur une période suffisamment représentative.

J'ai voulu regarder trois dimensions séparément : la consommation GitHub Actions, l'expérience du développeur et la fiabilité du processus.

Et il y a une petite surprise : le coût des runners n'est pas nécessairement le KPI le plus intéressant.

## Les mesures dont nous disposons réellement

Nous avons d'abord audité l'activité d'un repository applicatif, sans publier son nom.

Sur une fenêtre du 7 au 25 septembre 2026, la collecte recensait **561 exécutions de workflows, 635 jobs et 2 964 minutes de durée agrégée des jobs**.

Ce n'est pas une facture mensuelle. La fenêtre n'est pas un cycle de facturation complet, les workflows n'ont pas tous le même rôle et les durées agrégées ne sont pas automatiquement des minutes facturées après arrondi et déduction des quotas.

En revanche, c'était une bonne photographie pour identifier ce qui tournait, à quelle fréquence et pourquoi.

Nous avons également comparé une commande représentative de tests unitaires Go.

| Mesure | Temps observé | Ce que le chiffre représente |
| --- | ---: | --- |
| CI historique | 6 min 10 s en moyenne ; p95 à 9 min 48 s | Job complet sur GitHub Actions, sur la fenêtre d'audit |
| Runner GitHub simplifié, froid | 4 min 32 s | Exécution dédiée à la comparaison |
| Runner GitHub simplifié, chaud | 1 min 36 s | Même parcours, cache réutilisé |
| Test local, froid | 121,25 s | Exécution locale de la commande de tests |
| Test local, chaud | 38,63 s | Même commande avec cache de compilation réutilisé |

La différence est intéressante. Mais je ne vais pas annoncer « la CI est 2,5 fois plus rapide » sur cette base.

Les deux exécutions simplifiées ont été conçues pour comparer la même commande métier, mais leurs enveloppes ne sont pas strictement équivalentes : le job GitHub comprend ses étapes de démarrage et l'état des caches diffère, notamment pour les modules Go.

La seule affirmation solide est plus modeste : **sur cette expérience, le feedback local chaud de la commande choisie est arrivé en moins de 40 secondes**. Ce n'est pas encore le temps de validation complet d'une PR.

## Les dollars : partir de la facture, pas des impressions

Au moment de la rédaction, la grille publique GitHub indique **0,006 USD par minute pour un runner standard Linux x64 à deux cœurs** et **0,062 USD par minute pour un runner macOS standard**. Les prix, les tailles et les règles de facturation doivent être revérifiés avant publication et comparés à la facture réelle de l'organisation.

GitHub arrondit notamment le temps consommé **par job** à la minute supérieure. Sur les repositories privés, le montant effectivement facturé dépend également des minutes incluses dans le plan et de l'ensemble des autres usages de l'organisation.

Autrement dit, cette formule est utile pour simuler une consommation brute, pas pour deviner une facture :

~~~text
Coût brut estimé
  = somme, par classe de runner, des minutes facturables
    multipliées par le tarif applicable

Coût réellement facturé
  = coût brut ajusté des minutes incluses,
    du plan, des règles de facturation
    et des autres postes de consommation
~~~

Il faut aussi tenir compte des previews, des releases, des caches et du stockage d'artefacts. Déplacer les tests unitaires en local ne supprime pas les builds d'images.

Prenons un exemple fictif, volontairement simple.

| Hypothèse | Ancien modèle | Nouveau modèle |
| --- | ---: | ---: |
| PR par mois | 150 | 150 |
| Minutes de runners Linux pour les validations PR | 15 / PR | 3 / PR |
| Minutes Linux brutes | 2 250 | 450 |
| Coût brut à 0,006 USD/min | 13,50 USD | 2,70 USD |

*Scénario illustratif, pas une observation de nos factures et pas une estimation des dépenses totales.*

Dans cet exemple, on économise 1 800 minutes de runners et **10,80 USD de coût brut de calcul**, avant quotas inclus.

Ça peut sembler dérisoire lorsqu'on parle d'une transformation de la chaîne de développement.

Et justement : si quelqu'un me vendait ce projet uniquement avec cette économie, je lui demanderais pourquoi on passe autant de temps dessus.

Le calcul peut devenir très différent avec davantage de jobs, des runners macOS ou des machines plus importantes. Mais il faut le prouver avec le mix réel de jobs et les montants réellement facturés.

## Ce qui coûte parfois davantage : l'attente humaine

L'autre dimension est le temps de feedback.

Un agent peut continuer à produire du code pendant qu'un job tourne. Un développeur peut ouvrir un autre sujet. Donc **une minute de runner n'est pas une minute de développeur perdue**.

Il faut mesurer les attentes qui bloquent réellement la suite du travail.

Exemple purement hypothétique : 150 PR dans un mois, 3 minutes de feedback bloquant évitées par PR, dont seulement la moitié était effectivement du temps d'attente humain.

~~~text
150 PR × 3 min × 50 %
    = 225 min de temps bloquant potentiellement évité
    = 3 h 45
~~~

À un coût de capacité illustratif de 80 USD par heure, cela représente **300 USD de capacité valorisée**, pas 300 USD de trésorerie économisée. Personne n'a diminué automatiquement la masse salariale parce qu'un test tourne sur un Mac.

Et cette estimation doit être ramenée au temps supplémentaire passé à maintenir l'environnement local, à résoudre les problèmes de hooks et à provisionner les postes.

C'est exactement pour cela que je préfère mesurer le blocage réel plutôt que le temps théorique d'un pipeline.

## Les KPI que je garderais

Je ne construirais pas un tableau de bord avec cinquante métriques. Quelques indicateurs reliés à de vraies décisions suffisent.

| Dimension | Indicateur | Pourquoi il compte |
| --- | --- | --- |
| Feedback | Médiane et p90 du changement au premier résultat exploitable | Vérifie que la boucle est devenue plus courte, pas seulement le meilleur cas |
| Flow | Délai PR ouverte → prête au merge | Montre si les contrôles ralentissent encore l'intégration |
| Friction | Relances et corrections par PR | Distingue les erreurs détectées tôt des validations qui se répètent |
| Coûts | Minutes facturées par type de runner et par surface | Permet d'isoler les jobs déplacés des builds conservés |
| Fiabilité | Taux de publication du statut sur le bon SHA | Détecte un publisher fragile ou une preuve périmée |
| Couverture | Contrôles requis réellement exécutés par type de changement | Évite d'acheter de la vitesse au prix d'un trou de validation |
| Onboarding | Temps d'un Mac neuf jusqu'à une PR réellement mergeable | Évalue le processus complet, pas seulement \`devenv shell\` |
| Ressenti | Temps d'attente bloquant déclaré ou observé | Mesure la différence dans le travail quotidien |

Je regarderais ces KPI par cohortes : backend, frontend, migrations, changements transversaux, documentation. Une médiane globale peut cacher des régressions importantes sur les changements SQL ou Rust.

Je garderais également les échecs de publication séparés des échecs de tests. Ce sont deux problèmes opérationnels différents.

## Comment je comparerais avant et après

Je prendrais deux périodes comparables, par exemple quatre semaines avant et quatre semaines après la fin effective du cutover.

Je figerais la définition des indicateurs au préalable, en distinguant les jobs PR, les previews, les releases et les benchmarks lancés manuellement.

Puis je calculerais :

~~~text
Variation des minutes GitHub
  = (minutes après - minutes avant)
    / minutes avant

Variation du délai de feedback
  = (p50 ou p90 après - p50 ou p90 avant)
    / valeur avant

Taux de publication correct
  = statuts publiés sur le SHA attendu
    / validations PR-ready publiables
~~~

Il faudrait aussi noter les facteurs de confusion : volume de PR, taille des changements, nombre de développeurs, évolution de la suite de tests, proportion de cache chaud et éventuels incidents GitHub.

Un changement de méthode ne doit pas être crédité d'une amélioration provoquée par un repository devenu temporairement plus calme.

## Trois garde-fous avant d'annoncer un résultat

Premièrement, le coût local existe. Batterie, CPU, disque, cache, charge sur les Mac, maintenance des environnements et support d'onboarding sont des ressources réelles, même si GitHub ne les facture pas.

Deuxièmement, le résultat de qualité ne doit pas se dégrader. Si les tests deviennent plus rapides parce qu'on en exécute moins que prévu, on n'a rien optimisé.

Troisièmement, le modèle de confiance reste explicite. Un statut GitHub App publié depuis un laptop n'est pas une attestation d'exécution indépendante.

La mesure doit donc couvrir le **temps, le coût et le niveau de garantie**, pas uniquement les lignes de facture.

## Mon bilan à ce stade

Nous avons des éléments mesurés, et ils montrent qu'une partie du feedback peut effectivement être rapprochée du développement.

Nous avons aussi identifié des difficultés réelles : provisionnement des credentials sur les nouveaux postes, publication après push, contrôle des surfaces affectées et nécessité de comparer les suites avant d'éteindre l'ancienne CI.

En revanche, je n'ai pas encore un bilan post-cutover consolidé qui permettrait d'affirmer un ROI global ou un pourcentage d'économie mensuelle observé.

Je préfère l'écrire ainsi. Le bon indicateur, ce n'est pas le pourcentage le plus spectaculaire. C'est celui qu'on pourra retrouver dans les logs, la facture et le quotidien de l'équipe.

Et le point de départ reste [la même réflexion que pour nos postes versionnés](/thinking/2026-10-24-versionner-postes-semver-nix/) : savoir ce qu'on a réellement déployé, exécuté et observé, plutôt que se satisfaire d'une configuration qui semble correcte.

## Sources

- [GitHub : prix des runners Actions](https://docs.github.com/en/billing/reference/actions-runner-pricing)
- [GitHub : fonctionnement de la facturation Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [GitHub : visualisation de l'utilisation Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/viewing-your-github-actions-usage)
