# Protocole de mesure — retour terrain CI locale

**Statut : protocole préparé, données non homologuées.**
**Périmètre : un unique projet interne pilote, jamais nommé dans le site public.**
**Dernière revue : 24 octobre 2026.**

Ce document définit **ce que nous pouvons mesurer**, **comment le calculer** et **pourquoi une diminution des minutes GitHub Actions n'est pas à elle seule un gain de productivité, de qualité ni de dépenses**.

## 1. Questions distinctes et hypothèses

| Question                                                           | Unité                                                                  | Source                                       | Ce qu'elle ne prouve pas                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Les runners hébergés exécutent-ils moins de travail ?              | Somme des durées des jobs en minutes                                   | GitHub Actions, API runs + jobs              | Ni le coût facturé, ni le temps de développement                   |
| Les changements obtiennent-ils un résultat exploitable plus vite ? | Médiane et p90 de l'intervalle changement → contrôle pertinent achevé  | Timestamps instrumentés côté poste **et** GH | Pas une simple comparaison de deux commandes                       |
| Le coût facturable a-t-il baissé ?                                 | Usage et montant nets, par SKU et dépôt                                | Rapport Billing GitHub, périodes calendaires | Pas la même chose que les minutes wall-clock                       |
| Les garanties sont-elles préservées ?                              | Matrice des contrôles requis, taux d'échappement, statut exact-SHA     | Scripts CI, rulesets, PR, incidents          | Un statut GitHub n'atteste pas l'exécution indépendante sur le Mac |
| L'équipe livre-t-elle mieux ?                                      | Lead time PR, taux de reprise, défauts en aval, ressenti contextualisé | PR, incidents, enquête équipe                | N'est **pas** directement déduit de la facture                     |

Objectif : mesurer le déplacement du travail répétitif des runners vers le poste, **sans dégrader le contrat qualité**.

## 2. Définir les périodes _avant_ de regarder les chiffres

Le changement de fonctionnement est intervenu le **9 octobre 2026**. Cette journée est une phase de transition, à **exclure** des fenêtres stabilisées.

Pour une comparaison crédible :

1. Choisir une fenêtre **avant, sans shadow/dual-run**, et une fenêtre **après stabilisation**, séparées par le cutover. Identifier et documenter les dates du shadow à partir de l'historique Git, au lieu d'en inventer la durée.
2. Utiliser des fenêtres d'une même durée, de préférence **28 jours chacune**. Un multiple entier de sept contient autant de lundis, mardis, etc. ; il n'élimine pas les autres effets saisonniers.
3. Fixer le fuseau **UTC** et des bornes **[début inclus, fin exclue)**. Conserver les mêmes règles dans toute la chaîne.
4. Garder les releases, les previews et les contrôles de sécurité dans des catégories séparées. Elles ne suivent pas la même causalité que les tests de PR.
5. Lancer une analyse de sensibilité : fenêtres **avec** et **sans** les jours de double exécution ; mêmes jours de semaine ; exclure/reprendre les campagnes de release atypiques.
6. Ne pas publier de chiffre « post stable sur quatre semaines » tant qu'une fenêtre complète n'existe pas.

**Au 24 octobre**, nous n'avons pas encore quatre semaines après bascule ; le REX doit rester explicitement provisoire.

### Les deux exports historiques : pourquoi ils ne suffisent pas

La première extraction, du **28 septembre au 9 octobre** (11 jours), indiquait **4 646,8 minutes de jobs, 1 684 démarrages** et **exactement 1 000 runs**. La seconde, du **9 au 20 octobre**, indiquait **212,5 minutes de jobs, 372 démarrages, 149 runs**.

Ce sont des **totaux d'export**. Ils ne sont pas une mesure causalement comparable, car :

- GitHub limite à **1 000 résultats par recherche filtrée**, notamment par \`created\`. Le premier export atteint exactement ce plafond : **complétude non démontrée**.
- La première période inclut une phase de double exécution des tests pour vérifier la parité.
- L'activité est différente : l'analyse historique mentionne **112 branches de PR actives avant**, **26 après**. Une branche active n'est **pas** un nombre de PR normalisé.
- La seconde période commence **le jour du cutover**, pas après une période de stabilisation.
- La somme des durées des jobs, le temps d'exécution d'un workflow et les minutes **facturées** ne sont pas interchangeables.

**Conclusion : ni le pourcentage brut calculé sur ces exports, ni une moyenne brute minutes / branche ne sont des « gains constatés » à afficher dans le titre.**

## 3. Reconstituer une base exhaustive et traçable

Script autonome fourni : [\`src/scripts/audit-actions-case-study.mjs\`](../../src/scripts/audit-actions-case-study.mjs).

Exemple de collecte **à exécuter seulement avec accès autorisé au dépôt interne**, résultats hors du dépôt public :

```bash
gh auth status

bun src/scripts/audit-actions-case-study.mjs collect \
  --repo OWNER/REPOSITORY \
  --start 2026-09-11 --end 2026-10-09 \
  --out /tmp/ci-audit-before.json

bun src/scripts/audit-actions-case-study.mjs collect \
  --repo OWNER/REPOSITORY \
  --start 2026-10-10 --end 2026-11-07 \
  --out /tmp/ci-audit-after.json

bun src/scripts/audit-actions-case-study.mjs compare \
  --before /tmp/ci-audit-before.json \
  --after /tmp/ci-audit-after.json
```

**Ces dates sont un gabarit de fenêtres de 28 jours**, et **ne sont pas approuvées** avant vérification de la date de début du shadow. Elles ne décrivent pas des données déjà collectées au 24 octobre.

Le script :

- Découpe récursivement les recherches \`created\` en sous-périodes jusqu'à être **strictement sous la limite de 1 000 résultats** ; vérifie le nombre de résultats collectés pour chaque tranche.
- Récupère **tous les jobs de chaque run et toutes leurs tentatives** (\`filter=all\`), y compris les jobs échoués/annulés. Les jobs \`skipped\` n'ont pas de temps runner.
- Contrôle les doublons, les périodes, les jobs orphelins et les dates d'exécution invalides ; **échoue sans publier de KPI** si les données sont incomplètes.
- Conserve la liste des fenêtres effectivement interrogées, le nombre attendu/reçu et l'horodatage de l'extraction dans la preuve brute.
- Produit une ventilation par workflow et type d'événement ; les dépôts privés et identifiants restent dans les fichiers **hors Git**.

**Définition importante :** l'extraction regroupe les **runs créés** durant la période et additionne leurs jobs, y compris les éventuelles relances visibles au moment de la collecte. C'est une mesure **par cohorte de runs**, pas un export comptable des minutes consommées à chaque date. Une relance tardive peut modifier cette cohorte ; il faut donc figer les snapshots et leur horodatage. La facturation se vérifie séparément.

## 4. Les formules, avec les bons dénominateurs

### A. Charge des runners, **observation descriptive**

Pour chaque job exécuté \`j\`, en excluant les jobs \`skipped\` :

\`durée(j) = completed_at(j) - started_at(j)\`

\`runner-minutes = somme(durée(j) / 60)\`

Inclure les tentatives réexécutées et les jobs en échec ou annulés : ils ont consommé du calcul. Ne pas confondre la somme des durées des jobs parallèles avec l'horloge d'un run.

\`variation brute (%) = 100 × (total_après / total_avant - 1)\`

**N'utiliser cette variation que si les deux exports sont exhaustifs.** Même alors, elle décrit **un volume d'exécution**, pas l'effet causal de la migration.

### B. Coût des validations de PR à périmètre comparable

Identifier **chaque PR réellement active côté code** (PR et révisions proposées à l'intégration), indépendamment de l'existence de jobs GitHub Actions. Une PR sans runner après la bascule compte **au dénominateur**.

Établir un registre avec : identifiant PR, dates de commits/push, révision testée, taille du changement, surfaces touchées, présence de migrations, présence de code partagé, catégories de contrôles requises et nombre de tentatives. Ne **pas** assimiler \`head_branch\` à un identifiant de PR, ni \`updated_at\` à un push de code.

Classer les PR par risque/surface : \`docs-only\`, \`backend\`, \`frontend\`, \`db\`, \`rust\`, \`shared/mixed\`. Les catégories doivent être **exclusives** ; un changement multi-surfaces rejoint \`shared/mixed\` plutôt que de compter trois fois.

Pour chaque classe \`s\` et période \`t\` :

\`m(t,s) = minutes des validations PR hébergées attribuables à la classe s / nombre de PR éligibles de classe s\`

Fixer **avant le calcul** des poids \`w(s)\` correspondant à la distribution **avant** (ou à une distribution de référence métier explicitement justifiée) :

\`m_standardisé(t) = somme_s [ w(s) × m(t,s) ]\`

La variation de \`m_standardisé\` neutralise **une partie** de la variation de composition des PR. Elle ne neutralise pas automatiquement l'effet de la taille des changements, les rebases, les retries, les pratiques d'équipe ou les releases.

**Interdire ce calcul** si l'inventaire des PR est incomplet, si une classe utile est absente d'une période ou si les vérifications requises ne sont pas comparables. Publier alors des données stratifiées avec les tailles d'échantillon \`n\`, et « données insuffisantes ».

### C. Ce qui n'est **pas** un coût de PR

Compter séparément :

- **Releases** : minutes par release et par **composant effectivement reconstruit** (un retag sans rebuild n'est pas un build).
- **Previews** : minutes par demande de preview/PR effectivement concernée.
- **SAST/DAST** : minutes par scan et politique de couverture ; ne pas « gagner » en réduisant silencieusement la fréquence.
- **Automatisations** : minutes par exécution selon la fréquence du workflow.

Ne pas diviser toutes les minutes du dépôt par le nombre de PR : l'activité de release et d'automatisation est un autre processus.

### Mode opératoire pour la normalisation par PR

La collecte automatique seule ne connaît **pas** la population complète de PR : elle ignore, par définition, les changements pour lesquels aucune Action n'a été lancée. Il faut donc produire **deux inventaires indépendants de GitHub Actions**, couvrant toutes les PR actives sur la période de référence et sur la période après bascule.

La notion de **PR éligible** doit être fixée avant de compter : par exemple, une PR ayant proposé une nouvelle révision de code pendant la fenêtre. Une PR ouverte depuis un mois sans changement dans la fenêtre ne vaut pas une nouvelle unité de validation. Pour éviter les doubles comptes, une même PR contribue au maximum **une fois par période**, avec toutes ses révisions et tous ses runs de validations rattachés. Les relances restent comptées dans les minutes.

Classer chaque PR **une seule fois** dans l'une des classes suivantes : \`docs-only\`, \`backend\`, \`frontend\`, \`db\`, \`rust\`, \`shared/mixed\`. \`shared/mixed\` inclut les fichiers communs et les changements touchant plusieurs surfaces. La classe doit se déduire du diff **complet avec la branche de base**, pas simplement de \`HEAD~1\`. Une catégorie absente d'une période interdit une agrégation standardisée sur l'ensemble de ces catégories.

Exemple synthétique de manifeste \`/tmp/pr-before.json\` (**ne jamais committer les vrais manifestes du dépôt pilote**) :

```json
{
  "population_verified": true,
  "quality_parity_verified": true,
  "source": "Extraction PR par API et revue manuelle de la matrice de contrôle, horodatées et archivées hors Git",
  "window": {
    "start": "2026-09-11",
    "end": "2026-10-09"
  },
  "pull_requests": [
    { "number": 101, "category": "backend", "validation_run_ids": [10001, 10002] },
    { "number": 102, "category": "docs-only", "validation_run_ids": [] }
  ]
}
```

Le manifeste « après » reprend **la même structure** et sa propre fenêtre. Le tableau ci-dessus est uniquement un exemple de syntaxe, **pas une population réelle ni un résultat**. Une PR à zéro runner reste nécessairement dans la liste avec \`validation_run_ids: []\`.

**Procédure d'établissement de la population :** extraire les PR + leurs révisions (push/commits), conserver les identifiants PR stables, vérifier que les périodes sont intégralement couvertes par les bornes \`created/updated\` et l'historique des commits, classer leurs diffs par risque, rapprocher tous les runs liés au SHA et à la PR, puis vérifier manuellement les événements \`push\` ou déclenchements manuels rattachés. Les runs **release, preview, sécurité et automatisation** doivent rester exclus de \`validation_run_ids\`. Archiver la requête, les filtres et la liste finale en dehors du dépôt public. Le champ \`population_verified\` est une **attestation humaine** ; le script ne peut pas vérifier à lui seul la complétude de ce recensement.

Après collecte exhaustive et recensement des PR :

```bash
bun src/scripts/audit-actions-case-study.mjs compare \
  --before /tmp/ci-audit-before.json \
  --after /tmp/ci-audit-after.json

bun src/scripts/audit-actions-case-study.mjs normalize \
  --before /tmp/ci-audit-before.json \
  --after /tmp/ci-audit-after.json \
  --prs-before /tmp/pr-before.json \
  --prs-after /tmp/pr-after.json
```

Le mode \`compare\` ne calcule **aucun « gain »** : il imprime les volumes d'exécution par workflow et type d'événement. Le mode \`normalize\` n'est autorisé qu'avec deux manifestes attestés et un inventaire complet. Il affiche **les poids fixés sur l'avant, les tailles d'échantillon par catégorie et les taux standardisés**, mais qualifie le pourcentage de **descriptif, non causal**.

Une classe faiblement peuplée a une forte incertitude même lorsque le calcul est arithmétiquement possible. Avant toute communication externe d'un pourcentage normalisé, vérifier la dispersion par classe et fournir un intervalle d'incertitude ou déclarer l'effectif insuffisant. Une standardisation **ne** corrige **pas** toute différence de complexité à l'intérieur d'une même catégorie.

### Pourquoi les runner-minutes ne doivent pas être confondues avec la facturation

Pour contrôler que l'indicateur est bien une **consommation GitHub-hosted**, vérifier la classe des runners dans les jobs (\`labels\`, \`runner_group\`, etc.) et exclure explicitement tout self-hosted éventuel. Sans preuve de cette classification, l'indicateur doit rester « durée des jobs GitHub Actions », pas « minutes facturées ».

### D. Feedback et temps humain

Comparer **la même famille de contrôles**, sur une machine et un runner décrits (CPU, mémoire, outillage, caches, état devenv), avec des échantillons répétés :

- \`T_feedback = résultat pertinent disponible - instant du changement/push\`
- Mesurer **médiane et p90**, froid et chaud séparés, et le taux de vérifications réellement lancées.
- Mesurer ensuite \`T_mergeable = instant où tous les contrôles et validations requis sont satisfaits - ouverture/dernier push\`, en spécifiant le point de départ et en distinguant attente humaine et temps de test.

Le benchmark ciblé du **2 octobre** trouvait \`38,63 s\` sur le poste à chaud et \`1 min 36 s\` sur un runner simplifié à chaud pour la même commande Go. **Deux exécutions ciblées ne forment pas une distribution statistique du délai de feedback de toutes les PR.** Le job GitHub historique de \`6 min 10 s\` en moyenne exécutait des étapes supplémentaires : comparaison directe invalide.

### E. Coût financier

Source obligatoire : export **Billing GitHub** détaillé, par \`repository × SKU × date\`, avec les quotas, tarifs et conditions d'abonnement effectivement appliqués.

\`coût évité net = dépense facturée de référence ajustée - dépense facturée après\`

La durée runner ne suffit pas à déterminer ce coût. Ajouter le coût de maintenance du devenv, la charge Mac, l'onboarding et les échecs de publication du statut.

**Sans facture comparée, ne publier aucun gain en euros ni en dollars.**

## 5. Conditions de validation avant publication

1. **Complétude** : aucun segment de recherche à 1 000, pas de runs/jobs manquants, toutes les tentatives et les bornes UTC contrôlées.
2. **Comparabilité** : 28 jours stabilisés, matrice \`avant / shadow / après\`, même nomenclature des workloads, catégories de PR et échantillons par classe documentés.
3. **Parité qualité** : vérification des commandes équivalentes, des E2E exigés/non exigés, du statut sur le SHA exact et du périmètre Linux/macOS.
4. **Sensibilité** : refaire les totaux en excluant la phase de double-run et en séparant les relances/campagnes de release.
5. **Facturation** : ne pas assimiler le rapport d'API à l'export financier.
6. **Confidentialité** : pas de nom de repo, nom de produit interne, identité de salarié, commit privé, URL privée, capture brute ni montant de facture privée dans le billet public.
7. **Reproductibilité** : conserver la version du script, les fenêtres, la date de collecte et un hash local des exports complets.

### Décision éditoriale

- **Publier maintenant** : méthode, décisions d'architecture, échantillons bruts signalés comme incomplets, et benchmark ciblé correctement qualifié.
- **Attendre un audit normalisé** : toute affirmation « nous avons gagné X % de CI », « X % de temps développeur », « X € par mois ».
- **Garder le billet du 13 novembre en brouillon** si l'audit n'est pas terminé ; une date dans la frontmatter ne doit pas forcer la publication d'un résultat non vérifié.
