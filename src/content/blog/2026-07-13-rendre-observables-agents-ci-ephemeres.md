---
title: "Rendre observables des agents CI éphémères sans changer l’expérience développeur"
description: "L’observabilité des agents CI éphémères doit naître avec l’image de plateforme, pas dans chaque pipeline."
pubDate: 2026-08-04T09:00:00.000Z
language: fr
contentType: architecture-decision
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - CI
  - Observability
  - Platform Engineering
  - Kubernetes
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-06-observabilite-contrat-testable
---


Un agent de CI éphémère est conçu pour disparaître. Il démarre pour exécuter un job, charge ses outils, produit un résultat, puis s’éteint. Cette propriété améliore l’isolation et limite la dérive de configuration. Elle supprime aussi la scène du crime.

Lorsqu’un job échoue, l’équipe applicative voit une étape rouge et quelques lignes de log. L’équipe plateforme retrouve parfois un conteneur déjà détruit. Entre les deux, personne ne sait facilement si le problème venait du code, de l’outil exécuté, du processus de l’agent, d’une saturation ou de la collecte elle-même.

Le problème n’est donc pas seulement de « monitorer un runner ». Il faut rendre observable un système dont chaque instance a une durée de vie courte, sans demander à chaque pipeline de devenir un projet d’instrumentation.

## L’erreur fréquente : pousser l’instrumentation dans les pipelines

La première réponse consiste souvent à ajouter une étape commune dans les pipelines : démarrer un collecteur, envelopper certaines commandes ou envoyer des logs en fin de job. Cette approche déplace le coût au mauvais endroit. Chaque dépôt doit adopter la convention, les anciens pipelines divergent et les templates se multiplient. Surtout, une instrumentation lancée par le job voit mal ce qui se passe avant son démarrage ou après son interruption brutale.

Le dashboard-first est un autre piège. Un beau tableau de bord peut agréger des métriques techniquement correctes sans répondre à une question opérationnelle. Savoir qu’un processus consomme de la mémoire ne dit pas encore si l’agent accepte du travail, si un worker progresse ou si une commande est bloquée.

L’observabilité ne commence ni dans le pipeline ni dans Grafana. Elle commence par une question de responsabilité : **quel composant doit garantir que tout agent neuf émet les signaux nécessaires à son exploitation ?**

## Mieux : embarquer l’observabilité dans l’image

Lorsque la plateforme maîtrise l’image de ses agents, elle possède déjà un point de distribution commun. Cette image définit les outils disponibles, leurs versions, l’utilisateur système et le comportement de démarrage. Elle peut aussi définir le contrat d’observabilité.

Le changement de modèle mental tient en une phrase :

> Un agent jetable doit naître déjà observable, sans projet d’instrumentation par pipeline.

L’image devient alors le véhicule de trois garanties :

1. les signaux existent dès le démarrage ;
2. ils décrivent le travail réel de l’agent, pas seulement son conteneur ;
3. leur émission ne modifie pas l’interface utilisée par les développeurs.

Ce dernier point est décisif. Une plateforme réussit rarement en exigeant que des centaines de pipelines changent simultanément. Elle réussit lorsqu’elle améliore ses garanties tout en conservant les commandes, les templates et les habitudes déjà en place.

## Un modèle en cinq plans

Pour raisonner sans se perdre dans les outils, je décompose la chaîne en cinq plans : **source, cycle de vie, transport, décision et action**. Une faiblesse dans un seul plan rend l’ensemble trompeur.

### 1. Source : observer ce qui porte réellement le travail

Les métriques génériques du conteneur restent utiles, mais elles ne suffisent pas. Un agent peut être vivant au sens de Kubernetes et inutilisable au sens de la CI.

Il faut distinguer au moins trois catégories de signaux :

- **état de l’agent** : disponibilité, enregistrement, acceptation d’un job, présence des processus essentiels ;
- **état du travail** : job actif, durée, progression ou absence de progression, résultat ;
- **état des outils** : durée et résultat des commandes structurantes, erreurs répétées, exécutions anormalement longues.

### 2. Cycle de vie : faire démarrer le signal avec l’agent

Sur une instance persistante, un collecteur oublié peut être réparé plus tard. Sur un agent éphémère, un démarrage manqué crée immédiatement un angle mort.

L’instrumentation doit donc suivre le même cycle de vie que l’agent : présente dans l’image, lancée par le mécanisme de démarrage, arrêtée avec lui. Elle doit produire des logs structurés assez tôt pour expliquer les erreurs d’initialisation et surveiller les processus qui exécutent effectivement les jobs.

Cette coïncidence des cycles de vie est plus importante que le choix du collecteur. Elle transforme l’observabilité d’une option de déploiement en invariant de plateforme.

### 3. Transport : prouver le trajet, pas seulement l’émission

« L’exporter tourne » n’est pas un critère de succès. Le signal doit franchir toute la chaîne : exposition, découverte, collecte, stockage et requête.

Les labels doivent permettre d’agréger par pool, type d’image ou version, sans créer une cardinalité incontrôlée par job ou par commande.

Le test utile est simple : partir d’un agent fraîchement créé et retrouver, dans le système central, un signal attendu avec les dimensions nécessaires au diagnostic. Tant que cette preuve de bout en bout n’existe pas, la télémétrie reste une intention.

### 4. Décision : transformer des mesures en états opérables

Une métrique n’est pas une alerte. L’alerte doit exprimer un état qui justifie une intervention : processus essentiel absent, worker bloqué, taux d’échec anormal, disparition du signal pour un pool actif, ou latence durablement dégradée.

Les agents courts imposent de raisonner en population autant qu’en instance. La disparition d’un agent après son job est normale ; la répétition d’un même symptôme sur une version d’image ne l’est pas. Les règles d’enregistrement et les agrégations servent à faire émerger ces tendances sans alerter à chaque extinction légitime.

Une bonne règle indique ce qui est cassé, l’étendue probable et la dimension permettant de comparer les agents concernés. Elle évite les seuils arbitraires déconnectés de l’expérience CI.

### 5. Action : relier chaque alerte à une décision humaine

Le dernier plan est souvent négligé. Une alerte sans procédure transfère simplement l’enquête au destinataire.

Le runbook doit aider à répondre rapidement à quatre questions :

- le problème touche-t-il un agent, un pool ou une version d’image ?
- faut-il laisser finir, recycler, drainer ou revenir à une version précédente ?
- quels signaux permettent de confirmer le diagnostic ?
- comment vérifier le retour à la normale ?

## Conserver l’expérience développeur comme invariant

L’instrumentation des outils mérite une attention particulière. Ajouter un SDK dans chaque dépôt serait contraire au modèle. Une alternative consiste à interposer des wrappers transparents pour certaines commandes : même nom, mêmes arguments, mêmes codes de sortie, avec mesure de durée et du résultat autour de l’exécution réelle.

Mais « transparent » est une exigence, pas une promesse. Le wrapper ne doit modifier ni la sortie, ni les signaux, ni le comportement en cas d’échec. Un mécanisme de contournement reste nécessaire pour le diagnostic.

Le critère n’est pas l’absence totale de mécanisme supplémentaire. C’est l’absence de nouveau contrat imposé aux pipelines. Les développeurs continuent à lancer les mêmes commandes ; la plateforme acquiert une vision cohérente de leur exécution.

## Une checklist de préparation, sans attendre la perfection

Avant de déclarer un pool « observable », je cherche des preuves. Pas toutes le même jour :

- une image nouvellement publiée émet ses signaux sans étape de pipeline ;
- les processus qui portent le travail sont distingués de la simple santé du conteneur ;
- les outils instrumentés conservent arguments, sorties et codes de retour ;
- la télémétrie d’un agent neuf est visible de bout en bout dans le système central ;
- les dimensions permettent de comparer pools et versions sans explosion de cardinalité ;
- l’arrêt normal d’un agent ne déclenche pas une fausse alerte ;
- les règles détectent des situations actionnables, pas seulement des valeurs inhabituelles ;
- chaque alerte importante pointe vers une procédure testable ;
- l’équipe applicative n’a pas eu à modifier son pipeline pour bénéficier de ces garanties.

Le premier jalon utile est souvent plus étroit : **l’image naît avec un signal**, ce signal arrive dans le système central, une alerte de pool pointe vers une procédure d’une page. Les wrappers d’outils, le raffinement des labels et la couverture des faux positifs viennent ensuite. Viser la checklist complète avant la première image instrumentée, c’est souvent ne jamais démarrer.

Un pool déjà lisible en incident, même incomplet, vaut mieux qu’un plan d’observabilité resté sur un slide.

## Au-delà d’un produit de CI

Le raisonnement vaut pour les agents Azure DevOps, les runners GitHub Actions ou GitLab, les exécuteurs Kubernetes et, plus généralement, tout compute éphémère fourni par une plateforme interne.

Quand une propriété doit être vraie partout (sécurité minimale, certificats, identité, journalisation ou télémétrie), la demander à chaque workload est rarement le meilleur levier. Il faut l’attacher à l’artefact ou au runtime que la plateforme distribue déjà, puis vérifier qu’elle reste compatible avec l’usage existant.

Les agents éphémères ne rendent donc pas l’observabilité impossible. Ils obligent à mieux placer la responsabilité. Le signal doit naître avec l’agent, suivre le travail réel, survivre assez longtemps dans le système central pour permettre l’enquête, puis déboucher sur une décision.

La vraie réussite ne se mesure pas au nombre de métriques ajoutées. Elle se reconnaît à une propriété simple : **un agent peut disparaître sans emporter avec lui la compréhension de ce qui vient de se passer, et sans que les développeurs aient eu à changer leur manière de travailler.**

Cette propriété s’acquiert par étapes. Au départ, la couverture est partielle ; sans image instrumentée, elle est nulle.
