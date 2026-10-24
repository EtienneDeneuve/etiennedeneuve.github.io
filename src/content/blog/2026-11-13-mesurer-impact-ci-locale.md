---
title: "CI locale : avant de parler de gains, il faut savoir mesurer"
description: "Notre premier pilote a réduit les jobs hébergés, mais les chiffres bruts ne suffisent pas. La méthode pour mesurer correctement consommation, feedback, qualité et coût."
pubDate: 2026-11-13T07:30:00.000Z
language: fr
translationKey: 2026-11-13-mesurer-impact-ci-locale
contentType: field-note
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
  - 2026-10-09-ia-accelere-code-ci-doit-suivre
  - 2026-10-16-deplacer-ci-sur-mac-devenv
  - 2026-10-23-github-garde-dernier-mot-ci-locale
  - 2026-10-30-tester-changement-sans-tout-relancer
  - 2026-11-06-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-28-versionner-postes-semver-nix
---

Au départ, nous voulions simplement éviter de faire tourner plusieurs fois les mêmes contrôles sur des runners GitHub.

Avec l'IA, le code arrive plus vite. Mais si chaque petite modification repart systématiquement dans une chaîne de tests longue, la boucle de correction finit par prendre davantage de place que le changement lui-même. Nous avons donc ramené une partie de la CI sur les postes.

Quelques semaines plus tard, un premier export GitHub Actions semblait donner un résultat spectaculaire. La tentation était évidente : un tableau « avant / après », un gros pourcentage et une conclusion sur la productivité.

**Nous avons préféré ne pas publier ce pourcentage.**

Non parce que les chiffres auraient été inventés. Mais parce qu'un calcul exact sur des données incomplètes reste une mauvaise mesure. Et une bonne mesure de la consommation des runners ne prouve toujours pas que l'équipe livre mieux.

Voici ce que nous avons changé sur **un petit projet interne pilote**, ce que nous avons réellement observé et la méthode que nous retenons pour savoir si cette architecture vaut la peine d'être généralisée.

## D'abord, ce qui a réellement changé

Le dépôt pilote réunit du Go, du Vue, PostgreSQL et une partie Rust. Avant la bascule, les PR lançaient plusieurs jobs distants : tests, typecheck, intégrations, validations propres à certaines applications. Chaque runner apportait son temps de préparation, son cache et parfois une seconde exécution d'un contrôle déjà disponible sur le poste.

Nous avons séparé les responsabilités.

Le **pre-commit** reste court. La validation **PR-ready** s'exécute dans un environnement local reproductible avec devenv, en incluant les tests d'intégration PostgreSQL lorsque le changement l'exige. Le choix des suites est lié aux surfaces et aux dépendances réellement touchées, pas seulement à l'extension d'un fichier.

GitHub conserve le dernier mot : une GitHub App publie le résultat de validation pour un **SHA précis**, et le ruleset exige ce statut. Les E2E suivent leur propre contrat ; les builds d'images Linux, les previews et les releases ne disparaissent pas au prétexte que nous avons des Mac puissants.

Le **9 octobre 2026**, nous avons retiré les anciens jobs hébergés de tests PR devenus redondants.

**C'est un résultat vérifiable dans l'architecture et l'historique Git, indépendamment du moindre pourcentage.**

La sécurité a toutefois une frontière importante : un statut publié depuis un poste n'est **pas** une attestation indépendante que les tests s'y sont réellement exécutés. Les permissions de la GitHub App, les bypass éventuels et les changements sensibles continuent à devoir être évalués selon le modèle de menace.

## Le premier piège : mesurer un export, pas toute l'activité

Notre extraction initiale annonçait une baisse très importante des minutes des jobs GitHub Actions sur deux fenêtres de onze jours.

En regardant les conditions de collecte, nous avons identifié trois problèmes.

**Premier problème : la complétude.** L'export « avant » contenait exactement **1 000 runs**. C'est précisément le plafond de résultats des recherches filtrées de l'API GitHub Actions. Une pagination classique ne permet pas de franchir ce plafond. Nous n'avions donc pas démontré avoir récupéré toute la période.

**Deuxième problème : l'activité.** Nous avions relevé **112 branches de PR actives** dans une fenêtre, contre **26** dans l'autre. Ce ne sont ni les mêmes volumes, ni nécessairement les mêmes types de changements. Diviser par le nombre de branches ne règle rien : une branche n'est pas une unité fiable de travail.

**Troisième problème : la transition.** Une partie du « avant » comprenait une période où l'ancienne et la nouvelle CI tournaient en parallèle pour vérifier leur équivalence. C'était la bonne méthode pour sécuriser la migration, mais un mauvais point de départ pour mesurer une économie permanente.

Ces chiffres initiaux restent dans notre dossier d'audit comme **observations brutes, non homologuées**. Ils ne méritent ni la une de cet article ni une extrapolation financière.

## Refaire la collecte sans perdre les runs

Nous préparons désormais des fenêtres de même durée, idéalement **28 jours complets**, hors phase de double exécution. Les dates seront arrêtées d'après l'historique réel du cutover, en UTC, avec un début inclus et une fin exclue.

Pourquoi 28 jours ? Pour disposer du même nombre de chaque jour de semaine. Ce n'est pas une correction magique de la saisonnalité, mais c'est plus défendable que deux tranches choisies après avoir vu le résultat.

La collecte découpe automatiquement une recherche GitHub trop volumineuse en sous-périodes. Aucune sous-requête ne doit atteindre le plafond des 1 000 runs. Chaque segment conserve le nombre attendu et le nombre récupéré. Une incohérence arrête le calcul.

Nous récupérons **tous les jobs et toutes les tentatives** de chaque run, y compris les relances, les échecs et les annulations qui ont consommé du temps. Un job non démarré n'est pas un job qui a consommé une minute de calcul.

La première métrique devient donc :

\`Minutes d'exécution = somme des (fin du job - début du job) / 60\`

C'est la **somme des durées des jobs**, pas le temps écoulé sur l'horloge lorsqu'ils tournent en parallèle. Et ce n'est pas non plus la facture GitHub, qui dépend d'autres règles.

Une fois la collecte exhaustive, on pourra comparer ces volumes. Pas avant.

## Normaliser ce qui doit l'être : les PR, pas les releases

Même une collecte parfaite ne corrige pas un changement d'activité entre deux périodes.

Il faut d'abord constituer l'**inventaire complet des PR éligibles**, y compris celles qui ont consommé **zéro minute GitHub Actions** après la bascule. Ne regarder que les PR associées à un workflow distant reviendrait à faire disparaître précisément une partie du gain recherché.

Ensuite, nous classons chaque PR **une seule fois**, selon le risque dominant et les contrôles attendus : documentation, backend, frontend, base de données, Rust ou changement partagé/multi-surfaces.

Pour chaque catégorie, nous calculons :

\`Minutes hébergées par PR = minutes des validations attribuées / nombre de PR éligibles\`

Mais si, avant, nous avions surtout des changements PostgreSQL et, après, surtout des corrections de documentation, cette moyenne ne signifie rien.

Nous fixons donc les **poids des catégories sur la population de référence « avant »**, puis appliquons exactement ces mêmes poids aux deux périodes :

\`M_standardisé = somme (poids de catégorie × minutes hébergées moyennes par PR de cette catégorie)\`

Pourquoi des poids fixes ? Pour éviter d'attribuer à l'architecture CI ce qui vient simplement d'une semaine où l'équipe a changé des fichiers plus faciles à valider.

Si une catégorie manque dans l'une des périodes, si les PR ne sont pas toutes recensées ou si les contrôles de qualité ne sont plus équivalents, **nous ne calculons pas de pourcentage standardisé**. Nous publions les données par catégorie et indiquons « comparaison insuffisante ».

Les releases, les previews et les scans de sécurité restent **hors de cette normalisation** : une release se mesure par release et par composant construit, un scan par politique de couverture, pas par nombre de PR.

## Le temps de feedback est encore une autre mesure

Nous disposons d'un petit benchmark ciblé du **2 octobre 2026**, sur une même commande Go :

| Environnement | Exécution observée |
| --- | ---: |
| Runner GitHub simplifié, cache chaud | 1 min 36 s |
| Poste local, cache chaud | 38,63 s |

C'est encourageant. Sur cette commande, le résultat était disponible plus vite localement.

Mais le nombre de passages, les différences d'environnement et la représentativité ne permettent pas d'en faire une statistique générale. Le job distant historique complet comprenait, lui, des étapes supplémentaires : le comparer directement à cette seule commande serait malhonnête.

Pour établir le gain de feedback, nous devrons mesurer le temps entre une modification et **le premier résultat exploitable**, avec la médiane, le p90, l'état des caches et le type de contrôle. Puis regarder séparément le temps nécessaire pour qu'une PR devienne réellement mergeable.

Une minute de runner évitée n'est pas automatiquement une minute d'attente supprimée pour un développeur.

## Et le coût réel dans tout ça ?

Il faut un troisième jeu de données : **le rapport Billing détaillé de GitHub**, par dépôt, catégorie de runner et période. Sans lui, une conversion « minutes × tarif public » ne donne pas une économie constatée.

Nous devons également compter la contrepartie : temps de maintenance du devenv, consommation du poste, onboarding, incidents liés au publisher de statuts et éventuels contrôles supplémentaires sur les changements sensibles.

L'un de nos incidents était très concret : un poste neuf pouvait réussir la validation locale et ne pas réussir à publier le statut requis, faute de credentials disponibles dans son Keychain. La sûreté du merge était préservée, pas l'expérience développeur.

Déplacer un coût hors de GitHub ne suffit pas à le faire disparaître.

## Ce que nous pouvons conclure aujourd'hui

Nous avons **effectivement réduit le nombre de familles de tests exécutées sur des runners hébergés pour les PR** du pilote, sans retirer ces familles de notre contrat de validation. Une commande Go ciblée a donné un retour plus rapide sur un poste chaud. Voilà ce que les éléments disponibles permettent d'affirmer.

Nous ne savons pas encore chiffrer correctement la réduction **normalisée** de consommation GitHub, la diminution médiane du délai de feedback, le gain net en euros, ni l'effet sur le débit ou la qualité de livraison.

Nous avons donc formalisé un [protocole reproductible avec ses formules, ses refus de calcul et son outillage de collecte](https://github.com/EtienneDeneuve/etiennedeneuve.github.io/blob/master/docs/research/ci-locale-protocole-mesure-2026-10.md). Nous mettrons les chiffres complets dans ce REX lorsqu'ils seront étayés par des fenêtres comparables.

**Tout retester systématiquement n'est pas une preuve qu'on maîtrise les dépendances. Mais tout optimiser à partir d'un tableau de minutes incomplètes n'est pas davantage une preuve qu'on maîtrise sa CI.**

Le véritable résultat de ce pilote, pour le moment, c'est d'avoir rendu les choix de validation plus explicites — et d'avoir défini comment nous allons vérifier qu'ils sont meilleurs.

## Documentation de référence

- [GitHub : liste des workflow runs, filtres et limites de recherche](https://docs.github.com/en/rest/actions/workflow-runs)
- [GitHub : liste de tous les jobs, y compris les tentatives précédentes](https://docs.github.com/en/rest/actions/workflow-jobs)
- [GitHub : facturation et usage des Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

*Retour d'expérience anonymisé sur un dépôt pilote. Les mesures initiales non normalisées sont volontairement exclues des conclusions.*
