---
title: "La cardinalité est une décision d’architecture, pas un réglage Grafana"
description: "Une plateforme Kafka fonctionne correctement. Les messages circulent, les consommateurs suivent et les équipes disposent enfin de métriques dans Grafana. Puis les ennuis…"
pubDate: 2026-09-08T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
  - Kafka
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Une plateforme Kafka fonctionne correctement. Les messages circulent, les consommateurs suivent et les équipes disposent enfin de métriques dans Grafana. Puis les ennuis commencent : les requêtes ralentissent, les tableaux de bord deviennent coûteux, certaines séries disparaissent sous l’effet de limites d’ingestion et personne ne sait quels labels sont réellement nécessaires.

Le réflexe est alors de chercher le bon réglage dans Grafana : réduire la période affichée, accélérer une requête, masquer une dimension ou augmenter une limite. Mais Grafana ne crée pas la cardinalité. Il ne fait que révéler une décision prise plus tôt — souvent sans qu’elle ait été explicitement formulée.

La cardinalité est une propriété de l’architecture d’observabilité. Elle se décide au moment où l’on choisit ce que l’on mesure, à quelle granularité, avec quelles dimensions et pendant combien de temps. Une fois les séries ingérées, le coût est déjà engagé.

## Le mauvais modèle mental : « collecter d’abord, trier ensuite »

Dans beaucoup d’organisations, la collecte suit une logique rassurante : conserver toutes les métriques et tous les labels « au cas où ». L’intention paraît prudente. Elle évite de devoir anticiper les futurs besoins de diagnostic.

Cette prudence est trompeuse, car une métrique n’est pas une simple ligne de données. Dans un système compatible Prometheus, chaque combinaison unique de nom de métrique et de valeurs de labels constitue une série temporelle distincte.

Prenons une métrique portant les dimensions `cluster`, `topic`, `partition`, `consumer_group`, `client_id` et `instance`. Le nombre potentiel de séries n’est pas la somme de ces dimensions, mais leur produit. Même si toutes les combinaisons n’existent pas simultanément, quelques labels très variables suffisent à provoquer une croissance brutale.

Le danger vient rarement des dimensions stables comme l’environnement ou la région. Il vient des identifiants dont le domaine est vaste, mouvant ou mal maîtrisé : identifiant de client, nom d’instance éphémère, partition, URL, identifiant de requête, voire valeur issue d’une erreur. Un seul label non borné peut transformer une métrique utile en générateur de coûts.

Le problème n’est donc pas seulement le volume. Une cardinalité excessive détériore aussi l’usage : requêtes difficiles à écrire, agrégations lentes, alertes fragiles et tableaux de bord dont personne ne connaît plus la sémantique.

## Le bon modèle : un budget de dimensions

Je préfère considérer chaque métrique comme un contrat analytique doté d’un budget de dimensions.

Ce contrat doit répondre à quatre questions :

1. **Quelle décision opérationnelle cette métrique permet-elle de prendre ?**
2. **Quelles dimensions sont indispensables pour prendre cette décision ?**
3. **Quelle est la borne attendue de chaque dimension ?**
4. **À quel niveau du système faut-il conserver le détail ?**

Cette dernière question est essentielle. Toutes les investigations n’exigent pas la même granularité dans les métriques. Les métriques servent d’abord à détecter et à orienter. Les logs et les traces peuvent ensuite fournir le détail d’un événement ou d’une instance particulière.

Autrement dit, il ne faut pas demander aux métriques de devenir une base d’événements. Vouloir retrouver chaque requête, chaque message ou chaque client dans les labels revient à employer le mauvais signal pour le mauvais travail.

Pour Kafka, on peut raisonner par niveaux :

- **Santé de la plateforme** : disponibilité, débit, latence, erreurs, capacité et saturation au niveau du cluster ou du service.
- **Santé des flux** : métriques par topic, groupe de consommateurs ou application, lorsque ces dimensions correspondent à une responsabilité opérationnelle claire.
- **Diagnostic fin** : partitions, clients ou instances, conservés seulement lorsqu’ils sont nécessaires, bornés et associés à une durée de rétention adaptée.
- **Événement individuel** : logs et traces, pas labels de métriques.

Ce découpage évite deux extrêmes : une vue tellement agrégée qu’elle ne permet aucun diagnostic, et une collecte tellement détaillée qu’elle compromet la plateforme d’observabilité elle-même.

## Le relabeling est une frontière d’architecture

Les outils de collecte — par exemple un agent compatible avec l’écosystème Prometheus — permettent de renommer, supprimer ou normaliser des labels avant l’écriture. Cette étape est parfois traitée comme une plomberie de configuration. Elle mérite pourtant le même niveau d’attention qu’un schéma de base de données ou qu’un contrat d’API.

Le relabeling matérialise la politique de données de l’observabilité :

- il supprime les dimensions inutiles ou dangereuses ;
- il harmonise les noms entre fournisseurs et environnements ;
- il transforme des valeurs trop détaillées en catégories stables ;
- il garantit qu’une même notion métier possède la même identité partout ;
- il évite de reporter les corrections dans chaque tableau de bord.

Cette frontière doit être placée aussi près que possible de la collecte. Filtrer après ingestion réduit éventuellement le bruit visuel, mais pas le nombre de séries déjà stockées. Un dashboard qui n’affiche pas un label coûteux ne le rend pas gratuit.

La normalisation précoce apporte également un bénéfice organisationnel. Les tableaux de bord, alertes et règles d’enregistrement peuvent s’appuyer sur un vocabulaire commun : `environment`, `region`, `service`, `cluster`, par exemple. Sans ce vocabulaire, chaque équipe reconstruit sa propre traduction et la plateforme accumule une dette sémantique.

## Concevoir la cardinalité avant le premier dashboard

Une revue simple suffit souvent à éviter les principaux pièges.

### 1. Partir des questions, pas du catalogue

Une API de métriques managée peut exposer des dizaines ou des centaines de mesures. Leur disponibilité ne constitue pas une raison de les ingérer. Il faut commencer par les questions opérationnelles : le service est-il disponible ? Le retard des consommateurs progresse-t-il ? Une ressource approche-t-elle de sa limite ? Quelle équipe doit agir ?

Chaque métrique sélectionnée doit servir une question identifiable.

### 2. Classer les labels selon leur risque

Pour chaque dimension, documenter :

- son utilité ;
- sa cardinalité actuelle ;
- sa croissance prévisible ;
- sa stabilité dans le temps ;
- son propriétaire ;
- la possibilité de l’agréger ou de la remplacer.

Un label comportant cinquante valeurs stables n’a pas le même risque qu’un label comportant cinquante valeurs renouvelées à chaque déploiement.

### 3. Fixer un budget et mesurer son évolution

Le budget ne doit pas être une limite abstraite. Il peut s’exprimer en nombre de séries par domaine, par environnement ou par source. L’important est de suivre sa trajectoire : nouvelles séries créées, labels dominants, métriques qui croissent le plus vite et coût par équipe ou service.

La cardinalité devient ainsi un indicateur gouverné, pas une surprise découverte pendant un incident.

### 4. Tester les règles avec des données réelles

Une convention élégante sur le papier peut échouer face à des noms générés dynamiquement ou à des ressources éphémères. Avant un déploiement large, il faut observer les valeurs réellement émises, simuler les règles de transformation et comparer le nombre de séries avant et après.

### 5. Préserver le chemin de diagnostic

Supprimer un label n’est pas toujours la bonne réponse. La question est de savoir si l’on peut encore passer d’une alerte à une cause probable. Une agrégation par service peut suffire si les logs et les traces permettent ensuite d’identifier l’instance ou le client concerné.

Une bonne politique de cardinalité réduit le détail redondant sans rendre le système opaque.

## Le tableau de bord est le dernier kilomètre

Grafana reste essentiel : il présente les signaux, facilite l’exploration et rend les écarts visibles. Mais il intervient au dernier kilomètre d’une chaîne qui commence à la source, passe par la sélection des métriques, la collecte, le relabeling, le stockage et les règles d’agrégation.

Lorsqu’un tableau de bord est lent ou illisible, il faut donc remonter cette chaîne. La bonne question n’est pas seulement « comment optimiser cette requête ? », mais « pourquoi ces séries existent-elles et quelle décision servent-elles ? »

Ce raisonnement dépasse Kafka, Prometheus ou Grafana. Il s’applique aux dimensions des logs, aux attributs des traces, aux tags du cloud et aux événements analytiques. Partout, la donnée flexible finit par devenir une interface publique. Sans gouvernance, chaque nouvelle dimension augmente le coût technique et cognitif de toutes les équipes qui viendront après.

La cardinalité n’est pas un détail de tuning. C’est la forme concrète d’un choix : ce que l’organisation veut pouvoir distinguer, à quel prix et pour quelle action. Ce choix doit être fait avant que le premier dashboard ne donne l’illusion que tout collecter était gratuit.
