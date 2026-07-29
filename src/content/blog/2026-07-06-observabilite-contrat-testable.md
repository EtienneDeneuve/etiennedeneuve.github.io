---
title: "De la métrique au runbook : construire des alertes réellement opérables"
description: "Une alerte est un contrat d’exploitation testable : six maillons relient le phénomène réel au runbook, et versionner du YAML n’en prouve aucun."
pubDate: 2026-07-28T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - Observability
  - Alerting
  - SRE
  - GitOps
  - Platform Engineering
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
  - 2026-07-08-gitops-separer-versions-infra-et-images
---

Une alerte présente dans Git n’est pas nécessairement une alerte qui fonctionne. C’est d’abord un fichier : il peut être syntaxiquement valide, relu, approuvé, fusionné et déployé sans jamais atteindre la bonne personne, sans pointer vers le bon contexte et parfois sans même être évalué par le moteur supposé le faire.

Le YAML ne prouve rien à lui seul. Le PromQL non plus. Un dashboard vert non plus.

La seule question utile est la suivante :

**lorsque le problème réel se produira, est-ce que la bonne personne recevra un signal compréhensible et saura quoi faire ensuite ?**

Tant que cette chaîne n’a pas été testée, nous ne possédons pas une capacité d’exploitation. Nous possédons une intention versionnée.

## Le YAML est un emballage

Dans beaucoup de plateformes, l’observabilité est encore pilotée comme un inventaire.

On compte les métriques exposées. On compte les dashboards. On compte les règles d’alerte. On vérifie que tout est bien rangé dans Git, découpé dans les bons dossiers et déployé par GitOps.

Puis un incident arrive.

L’alerte ne part pas. Elle part trop tard. Elle arrive dans un canal que personne ne surveille. Elle déclenche une notification par pod. Elle pointe vers un dashboard supprimé. Le runbook décrit une architecture qui n’existe plus. L’équipe qui reçoit l’alerte ne possède même pas le composant.

Tout était pourtant « vert » dans la CI.

Le problème est simple : nous avons validé des fichiers alors qu’il fallait valider un système.

Une alerte traverse plusieurs couches, et chaque passage d’une couche à l’autre est un point de rupture. Tester uniquement la règle revient à tester une fonction au milieu d’une chaîne distribuée, puis à déclarer que le produit complet fonctionne.

## Une alerte est un contrat d’exploitation

Une alerte n’est pas une requête PromQL avec un seuil. C’est un contrat entre un phénomène technique, un impact opérationnel et une décision humaine.

Ce contrat relie six maillons, chacun devant pouvoir être prouvé séparément :

```text
Phénomène réel
  → signal collecté
    → indicateur interprétable
      → règle effectivement évaluée
        → notification contextualisée
          → décision guidée par un runbook
```

### 1. Le phénomène réel

Pas « la CPU dépasse 80 % ». Quelle capacité est menacée ? Quel service rendu à l’utilisateur risque de se dégrader ? Quel risque justifie d’interrompre quelqu’un ?

Une saturation CPU peut être normale. Une file qui ne se vide plus peut représenter une perte de capacité même si les machines semblent saines.

Le phénomène technique n’est qu’un moyen de détecter un risque. Il ne doit pas devenir une fin en soi.

### 2. Le signal qui fait autorité

La règle doit s’appuyer sur une série disponible dans le système central, avec une sémantique connue et des dimensions suffisamment stables. Un nom de métrique découvert dans un environnement de développement n’est pas encore un contrat.

Il faut savoir :

- qui produit la série ;
- où elle est collectée ;
- quels labels sont garantis ;
- quelle cardinalité elle peut générer ;
- comment elle se comporte lorsque la cible disparaît.

La question utile n’est pas « l’exporter tourne-t-il ? », mais « puis-je interroger aujourd’hui la série qui alimentera l’alerte demain ? ».

### 3. L’indicateur interprétable

Les métriques brutes sont rarement de bons signaux d’astreinte. Elles sont volatiles, trop détaillées ou dépendantes de la topologie du moment. Un indicateur dérivé (taux d’échec, absence de progression, saturation durable, écart à une référence) porte davantage de sens.

Les règles d’enregistrement peuvent fournir une interface métrique stable : elles pré-calculent une expression et écrivent une nouvelle série sous un nom choisi. Cette stabilité n’est pas automatique. Elle dépend d’un nommage gouverné, d’une expression dont les changements sont revus et d’un contrat explicite sur les labels conservés.

### 4. La règle réellement évaluée

Une règle ne devient réelle que lorsqu’un moteur identifié la charge, l’évalue et expose son état. Pour Prometheus, l’API du moteur actif permet de le vérifier. Cette commande échoue si `QueueStalled` n’apparaît pas dans les règles exposées :

```shell
curl --fail --silent --show-error \
  "$PROMETHEUS_URL/api/v1/rules?type=alert" |
  jq -e '.data.groups[].rules[] | select(.name == "QueueStalled")'
```

Un `kubectl get PrometheusRule` ne remplace pas cette vérification : la présence de la ressource Kubernetes prouve l’intention déclarée, pas son chargement par le Prometheus interrogé.

C’est aussi le maillon où se joue la question de propriété. L’équipe qui écrit la règle, celle qui maintient le moteur d’évaluation et celle qui répond à l’incident ne sont pas toujours les mêmes. La séparation entre **ownership de l’intention** et **ownership de l’exécution** est saine, à condition d’être écrite. Il faut pouvoir nommer :

- le propriétaire du composant ;
- le propriétaire du signal ;
- le propriétaire du runtime d’évaluation ;
- le destinataire opérationnel ;
- le responsable de la mise à jour du runbook.

Sans cela, deux dépôts peuvent contenir des définitions plausibles tandis que personne ne sait laquelle est active. Et une alerte sans propriétaire clair devient mécaniquement la responsabilité de tout le monde, donc de personne.

### 5. La notification contextualisée

« Threshold exceeded » n’est pas un message d’exploitation. La notification doit expliquer ce que le signal implique probablement : augmentation des erreurs, saturation imminente, traitement bloqué, dépendance externe indisponible, perte de redondance ou risque de dépassement de capacité.

L’opérateur ne devrait pas avoir à reconstruire l’architecture du produit à partir d’un nom de métrique.

Elle doit aussi éviter les dimensions instables qui fragmentent artificiellement un même incident. Une alerte par instance éphémère peut produire cinquante pages pour une seule dégradation de capacité. Le bon niveau d’agrégation est celui auquel une équipe peut prendre une décision.

### 6. La décision guidée par un runbook

Le runbook n’est pas une encyclopédie d’architecture. C’est une interface de décision sous contrainte, pour un opérateur qui connaît la plateforme sans forcément connaître ce composant précis.

Au minimum, il décrit :

- le symptôme et son impact probable ;
- les premières vérifications, dans l’ordre ;
- les faux positifs connus ou situations normales proches ;
- les actions réversibles autorisées ;
- les conditions d’escalade ;
- les éléments à conserver pour l’analyse après incident.

Un runbook utile précise aussi ce qu’il ne faut pas faire. En situation de stress, une limite explicite protège autant qu’une commande de diagnostic.

Une alerte qui ne permet aucune action est une notification, pas un outil d’exploitation.

## La CI doit tester le contrat, pas seulement sa grammaire

Les contrôles statiques restent utiles. Ils doivent simplement aller plus loin que `promtool check rules`.

La syntaxe est le niveau zéro.

Un test unitaire permet déjà de vérifier qu’une série donnée fait passer la règle en état `firing` au moment attendu. Par exemple, avec cette règle :

```yaml
# alerts.yml
groups:
  - name: availability
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "Instance {{ $labels.instance }} indisponible"
```

Le scénario associé injecte dix minutes de signal à zéro et vérifie les labels et annotations produits :

```yaml
# alerts.test.yml
rule_files:
  - alerts.yml
evaluation_interval: 1m
tests:
  - interval: 1m
    input_series:
      - series: 'up{job="api", instance="api-1"}'
        values: "0x10"
    alert_rule_test:
      - eval_time: 10m
        alertname: InstanceDown
        exp_alerts:
          - exp_labels:
              severity: page
              job: api
              instance: api-1
            exp_annotations:
              summary: "Instance api-1 indisponible"
```

```shell
promtool test rules alerts.test.yml
```

Ce test ne prouve ni le routage ni la réception de la notification. Il bloque néanmoins une régression sur l’expression, la temporisation, les labels et les annotations avant le déploiement.

### Le signal doit exister

Une règle ne devrait pas être fusionnée lorsqu’elle référence une métrique inconnue, un label inexistant ou une recording rule qui ne sera pas disponible dans l’environnement cible.

Le test ne consiste pas uniquement à parser la requête. Il consiste à vérifier que ses hypothèses correspondent au système réellement déployé.

Pour certaines plateformes, cela peut passer par un catalogue de métriques versionné. Pour d’autres, par des tests exécutés contre un environnement représentatif ou une API de métadonnées.

Le mécanisme importe moins que le résultat : empêcher de déployer des règles déjà mortes.

### Les labels doivent être maîtrisés

Une alerte par pod, par conteneur, par instance et par endpoint peut transformer un seul incident en plusieurs milliers de notifications.

Le routage et l’agrégation doivent être contrôlés avant le déploiement :

- labels obligatoires ;
- labels interdits ;
- dimensions utilisées pour le `group_by` ;
- protection contre les cardinalités absurdes ;
- cohérence entre les labels de la règle et ceux utilisés par Alertmanager.

Le bruit n’est pas une fatalité. C’est généralement un défaut de conception que nous avons accepté de déployer.

### La sévérité doit avoir une conséquence réelle

Une valeur `critical` n’a aucun intérêt si elle ne correspond à aucune politique opérationnelle.

Chaque niveau doit impliquer un comportement défini :

- information enregistrée sans interruption ;
- notification durant les heures ouvrées ;
- création automatique d’un ticket ;
- appel d’astreinte immédiat ;
- escalade après absence d’acquittement.

Si deux sévérités produisent exactement le même routage, elles ne représentent probablement pas deux sévérités différentes.

### Les liens doivent fonctionner

La présence d’un champ `runbook_url` ne suffit pas.

Le lien doit être joignable, pointer vers une ressource versionnée et contenir les informations attendues.

La CI peut vérifier :

- le format de l’URL ;
- son existence ;
- l’absence de redirection vers une page générique ;
- la présence de sections minimales ;
- la cohérence entre le nom de l’alerte et le runbook associé.

Une URL morte est une dette opérationnelle détectable avant l’incident. La laisser passer est un choix.

### La notification doit contenir du contexte

Une alerte exploitable devrait au minimum exposer :

- le service ou la capacité concernée ;
- l’impact probable ;
- le périmètre affecté ;
- la valeur observée ;
- la durée de la condition ;
- un lien vers une vue utile ;
- un lien vers le runbook ;
- le propriétaire attendu.

Un linter peut détecter les annotations absentes, génériques ou manifestement inutiles.

Ces contrôles ne garantissent pas que l’alerte fonctionnera. Ils garantissent au moins qu’elle n’est pas manifestement inutilisable avant même son déploiement.

## Le test de bout en bout complète les tests de règles

À un moment, il faut déclencher l’alerte.

Volontairement.

Le test doit parcourir la chaîne complète :

phénomène réel ou signal synthétique → collecte → stockage → évaluation → Alertmanager → routage → notification → ouverture du runbook.

Le test unitaire prouve le comportement déterministe de la règle. Le test de bout en bout vérifie ce qu’il ne couvre pas : chargement par le moteur actif, routage, livraison et utilisation du runbook.

Pas uniquement appeler un webhook Teams à la main.

Pas uniquement simuler une notification depuis l’interface d’Alertmanager.

Il faut tester le trajet réellement utilisé en production.

Pour une alerte critique, ce test devrait être traité comme un smoke test. Si nous considérons acceptable de tester qu’un déploiement répond sur son endpoint HTTP, nous devons considérer acceptable de tester que son principal mécanisme de détection d’incident fonctionne aussi.

Une alerte critique jamais déclenchée volontairement est une alerte dont personne ne connaît le comportement réel.

## Le contrat se dégrade même lorsque le YAML ne change pas

Une règle peut rester strictement identique pendant que tout ce qui l’entoure devient faux.

L’équipe change de nom. Le service migre. Les labels évoluent. Le canal Teams est archivé. Le dashboard est remplacé. Le runbook n’est plus maintenu. La criticité du produit augmente. Le volume rend un seuil historique obsolète.

Git ne détectera rien si aucun fichier ne change.

Le contrat d’observabilité doit donc être réévalué périodiquement.

Cela peut prendre plusieurs formes :

- exercices programmés sur les alertes critiques ;
- revues après incident ;
- suppression des alertes jamais actionnées ;
- analyse des acquittements et des faux positifs ;
- vérification automatique des liens ;
- revue d’ownership ;
- recalibrage des seuils à partir de l’historique ;
- tests de routage lors des changements organisationnels.

L’objectif n’est pas de conserver toutes les alertes.

L’objectif est de conserver la confiance dans les quelques alertes qui comptent.

## Une règle ne devrait pas arriver directement dans l’astreinte

Tout n’a pas besoin d’être parfait au premier jour. En revanche, une règle incomplète ne doit pas être présentée comme une règle prête pour la production.

Une progression saine peut ressembler à ceci.

### Étape 1 : observer

Le signal est collecté et visualisé. Sa stabilité, sa cardinalité et sa valeur opérationnelle sont étudiées.

Aucune astreinte n’est déclenchée.

### Étape 2 : notifier sans interrompre

La règle est évaluée et envoyée dans un canal non critique.

L’équipe observe son comportement réel, le volume généré et la qualité du contexte.

### Étape 3 : rendre actionnable

Le runbook, l’ownership, les annotations et le routage sont complétés.

Un test de bout en bout est réalisé.

### Étape 4 : autoriser l’escalade

La règle peut rejoindre un circuit d’astreinte uniquement lorsqu’elle a prouvé qu’elle détecte un problème important, avec suffisamment de précision pour justifier une interruption.

### Étape 5 : réévaluer, et accepter de retirer

Une règle promue à l’astreinte aujourd’hui peut devoir en sortir demain, parce que le service, le trafic ou l’organisation ont changé. Le déclassement fait partie du cycle au même titre que la promotion.

Une règle qu’on ne peut jamais supprimer devient une dette institutionnelle : personne ne la conteste, tout le monde la subit.

Ces quatre premiers niveaux évitent de transformer l’astreinte en environnement de test. Le cinquième évite d’y laisser des règles que plus personne ne défend.

## Le droit de se tromper doit faire partie du système

Le contrat d’observabilité ne sera pas parfait au premier déploiement. Une plateforme complexe ne révèle pas tous ses comportements dans une spécification ou une revue de code. Certains n’apparaissent qu’au pic d’activité, pendant une dégradation partielle, après un changement de dépendance, ou le jour où une autre équipe prend l’astreinte.

Une règle que nous pensions pertinente produira parfois trop de bruit. Une autre déclenchera trop tard. Un seuil sera faux. Une agrégation masquera un problème. Un label supposé stable disparaîtra. Un runbook se révélera inutilisable sous pression.

Ce ne sont pas des échecs du programme d’observabilité, à condition d’en tirer quelque chose de vérifiable :

- une fausse alerte doit expliquer pourquoi le signal était trop sensible ;
- une alerte manquée doit identifier le trou dans la couverture ;
- une notification incompréhensible doit améliorer ses annotations ;
- une escalade vers la mauvaise équipe doit corriger l’ownership et le routage ;
- un runbook inutile doit être réécrit à partir de ce qui a réellement fonctionné pendant l’incident.

C’est ce qui sépare une boucle d’apprentissage du simple droit à déployer vite des choses que personne ne maintient. Le véritable échec, c’est de garder une règle manifestement mauvaise parce qu’elle a été validée, documentée et déployée une fois.

## Commencer simple n’est pas un compromis honteux

Une première version peut être volontairement rudimentaire : une métrique connue, une règle simple, un canal non critique, quelques annotations utiles, un runbook minimal, une équipe identifiée.

Elle suffit déjà à observer la fréquence du signal, à repérer les dimensions pertinentes et à vérifier si l’événement détecté mérite vraiment une intervention humaine.

Chercher à concevoir immédiatement le système d’alerting définitif produit plutôt l’inverse : rien n’est livré pendant des mois, puis une architecture parfaite sur le papier arrive en production sans avoir rien appris du terrain.

Le danger commence lorsque l’on considère les règles comme des artefacts définitifs, que l’on ne touche plus parce qu’elles ont été validées une fois.

## La stabilité ne signifie pas l’immobilité

Une plateforme d’observabilité saine change en permanence.

Les seuils évoluent. Les SLO sont recalibrés. Les alertes inutiles disparaissent. Les runbooks s’améliorent. Les responsabilités bougent. De nouveaux signaux remplacent les approximations historiques.

Cette évolution n’est pas une preuve d’instabilité.

C’est ce qui maintient la plateforme alignée avec le système réel.

À l’inverse, une plateforme dont les dashboards, les règles et les runbooks ne changent plus depuis deux ans n’est probablement pas mature.

Elle est probablement abandonnée.

Le système continue à évoluer autour d’elle, mais son observabilité ne le suit plus. Elle présente encore une surface propre, des dépôts Git organisés et des pipelines verts, tout en décrivant progressivement un monde qui n’existe plus.

**Si l’observabilité n’évolue plus alors que le système change, elle n’est pas « terminée » : elle se déconnecte du réel.**

## Une définition du done

Je considère une alerte prête pour une exploitation réelle lorsque :

- le risque ou la capacité protégée est explicite ;
- le signal faisant autorité est identifié ;
- la requête fonctionne sur les données réellement collectées ;
- les labels et la cardinalité sont maîtrisés ;
- le runtime qui évalue la règle est connu ;
- le routage correspond à une politique de sévérité réelle ;
- la notification explique l’impact probable ;
- le propriétaire est identifiable ;
- le runbook permet une première action sûre ;
- les régressions évidentes sont bloquées par la CI ;
- le trajet complet a été testé au moins une fois ;
- son comportement réel peut être mesuré ;
- les erreurs et faux positifs alimentent une boucle d’amélioration ;
- une stratégie de révision, de déclassement ou de suppression existe.

Cette définition ne garantit pas que la règle est parfaite.

Elle garantit que nous pouvons l’utiliser, apprendre de son comportement et la faire évoluer sans nous raconter qu’un premier déploiement constitue un état final.

## Moins d’alertes, mais des alertes vivantes

Le but n’est pas d’alerter sur tout ce qui bouge. Personne n’a besoin de 50 000 alertes, et personne ne devient plus fiable en ajoutant du bruit à une plateforme déjà complexe. Le but est de détecter les événements qui exigent une décision humaine, puis de fournir assez de contexte pour que cette décision soit rapide et sûre.

La question dépasse l’alerting. Elle vaut pour les SLO, les dashboards d’astreinte, les recording rules, les tests de restauration et l’instrumentation des workloads éphémères. Partout où nous versionnons une intention dans Git, il reste à prouver qu’elle tient encore.

Une plateforme mature ne se reconnaît donc pas au volume de règles qu’elle héberge, mais au petit nombre de signaux auxquels les équipes font confiance, parce qu’ils ont survécu à plusieurs cycles de réalité.

## Sources officielles

- [Prometheus : tests unitaires des règles](https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/)
- [Prometheus : règles d’enregistrement](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
- [Prometheus : API HTTP des règles](https://prometheus.io/docs/prometheus/latest/querying/api/#rules)
- [Alertmanager : configuration du routage, du groupement et des inhibitions](https://prometheus.io/docs/alerting/latest/configuration/)
