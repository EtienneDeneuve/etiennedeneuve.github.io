---
title: "OpenTelemetry : cardinalité, PII et sampling, les pièges qui arrivent après"
description: "Une bonne télémétrie peut devenir toxique si on ne maîtrise pas les dimensions, les données sensibles et l’échantillonnage. Retour terrain sur les erreurs qui coûtent cher."
pubDate: 2026-09-22T21:40:00.000Z
language: fr
contentType: field-note
pillar: observability
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - OpenTelemetry
  - Observability
  - Cardinality
  - Sampling
  - PII
  - Tempo
  - VictoriaMetrics
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-09-22-opentelemetry-pourquoi-je-lai-propose
  - 2026-09-22-opentelemetry-instrumenter-200-services
  - 2026-09-22-opentelemetry-exploiter-la-plateforme
---

> Série **OpenTelemetry en production**, 3/4. Le précédent : [instrumenter environ 200 services](/2026-09-22-opentelemetry-instrumenter-200-services). La suite : [exploiter réellement la plateforme](/2026-09-22-opentelemetry-exploiter-la-plateforme).

400 000 bases.

Et nous avions ajouté le nom de la base dans les traces.

Sur le moment, l’idée paraissait parfaitement logique.

Quand une application parle à autant de bases différentes, savoir laquelle est concernée par une opération est extrêmement utile pour le diagnostic.

Le problème n’était pas la trace.

Le problème était ce que cette information allait devenir ensuite.

## Une dimension utile n’est pas forcément une bonne dimension partout

Tempo peut générer des métriques à partir des spans.

C’est très pratique.

Le metrics-generator peut notamment produire des métriques RED dérivées des traces, que l’on envoie ensuite vers un backend de métriques comme VictoriaMetrics.

Mais cela introduit une transformation fondamentale :

une information qui vivait dans une trace peut devenir une dimension de série temporelle.

Et là, les règles changent.

Une trace est un événement riche.

Une métrique est une série identifiée par un nom et un ensemble de labels.

Si l’un de ces labels possède des centaines de milliers de valeurs différentes, la cardinalité explose.

C’est exactement le genre de problème que nous avons rencontré.

L’information "nom de la base" était utile pour comprendre une trace particulière.

Elle était beaucoup moins sympathique lorsqu’elle se retrouvait impliquée dans la génération de métriques.

## Le pipeline transforme la donnée

C’est probablement la leçon la plus importante de cet incident.

Quand on ajoute un attribut à une trace, il ne faut pas seulement se demander :

> "Est-ce que cette information est utile ici ?"

Il faut aussi se demander :

> "Qu’est-ce que cette information peut devenir plus loin ?"

Un identifiant utilisateur.

Un UUID de requête.

Un nom de job généré dynamiquement.

Un chemin complet.

Un nom de base parmi plusieurs centaines de milliers.

Tous peuvent être parfaitement utiles dans une trace ou dans un log.

Tous peuvent être catastrophiques comme label de métrique.

La cardinalité n’est donc pas uniquement un sujet Prometheus.

C’est un sujet de **modélisation de la télémétrie de bout en bout**.

## La bonne réaction n’est pas toujours de supprimer l’information

Lorsque ce genre de problème arrive, la réponse instinctive est souvent de supprimer complètement l’attribut.

Ce n’est pas nécessairement le bon choix.

Une donnée peut avoir beaucoup de valeur pour les traces tout en devant être exclue des métriques dérivées.

L’objectif est donc de décider à quel niveau l’information reste pertinente.

Dans notre cas, nous avons retravaillé la manière de traiter l’information liée aux bases pour éviter qu’elle génère une cardinalité non bornée dans la partie métrique.

Le détail précis de cette correction dépend de la configuration du pipeline et mérite d’être documenté séparément.

Mais la règle générale est déjà claire :

**la richesse des traces ne doit pas être copiée naïvement dans le modèle de labels des métriques.**

## Les identifiants dynamiques sont les suspects habituels

Les bases n’étaient pas le seul sujet.

Comme souvent, les identifiants qui changent constamment sont les premiers candidats aux problèmes de cardinalité.

On retrouve notamment :

- identifiants de requête ;
- identifiants utilisateurs ;
- identifiants de job ;
- UUID ;
- noms de ressources générés ;
- URLs complètes ;
- noms de fichiers ou de traitements contenant des valeurs dynamiques.

Le piège vient du fait que ces valeurs donnent souvent l’impression d’améliorer le diagnostic.

Et c’est vrai dans une trace individuelle.

Mais une métrique n’a généralement pas besoin de savoir qu’une requête particulière a duré 170 ms.

Elle a besoin de savoir que le groupe de requêtes correspondant à une opération ou un service présente telle distribution de latence.

La distinction paraît évidente lorsqu’elle est formulée ainsi.

Elle l’est beaucoup moins lorsque l’on construit progressivement une instrumentation sur plusieurs centaines de services.

## Les PII arrivent très vite dans les logs

La même migration a posé un autre problème : les données sensibles.

Lorsque l’on améliore la corrélation entre logs et traces, on enrichit naturellement les événements.

Et plus on enrichit, plus on augmente la probabilité de transporter des données qu’on ne veut pas voir finir dans un backend d’observabilité.

Nous avons donc introduit du filtrage pour les PII, les RIB et d’autres informations sensibles.

Le filtrage se fait à deux niveaux.

D’abord dans les bibliothèques communes lorsque nous contrôlons la production du log.

Ensuite dans la couche de collecte, comme seconde protection.

Cette double approche est volontaire.

Le meilleur endroit pour empêcher une donnée sensible d’exister reste le code qui produit le log.

Mais dans un environnement brownfield, il est difficile de garantir que chaque chemin historique respecte immédiatement cette règle.

Le collecteur devient donc un filet supplémentaire.

## Les expressions régulières sont utiles, mais ce n’est pas une politique de sécurité

Une partie du filtrage repose sur des expressions régulières.

C’est pratique pour certaines familles de données : formats de comptes bancaires, identifiants structurés ou motifs reconnaissables.

Mais il ne faut pas confondre cette protection avec une vraie gouvernance des données.

Une regex ne sait pas toujours reconnaître qu’un champ de texte libre contient une information personnelle.

Elle ne sait pas non plus que tel identifiant interne est considéré comme sensible dans un contexte particulier.

Le filtrage technique doit donc compléter des règles plus simples :

- éviter de logger ce qui n’est pas nécessaire ;
- préférer des champs explicitement connus ;
- limiter les attributs ajoutés aux spans ;
- documenter les informations autorisées ;
- traiter le collecteur comme un contrôle supplémentaire, pas comme le seul garde-fou.

OpenTelemetry standardise très bien le transport.

Il ne décide pas à notre place ce que nous avons le droit de transporter.

## Tout conserver n’est pas un objectif

Une fois la collecte fiabilisée, une autre tentation apparaît : conserver toutes les traces.

Techniquement, c’est séduisant.

On se dit que si une trace existe, elle pourrait peut-être servir un jour.

À l’échelle d’une plateforme importante, ce raisonnement devient vite coûteux.

Le stockage augmente.

Le réseau augmente.

Les backends travaillent davantage.

Les requêtes deviennent plus lourdes.

Le coût SaaS peut également augmenter très vite lorsqu’une partie des données est envoyée vers des solutions facturées à l’ingestion.

L’objectif n’est donc pas de maximiser le volume.

L’objectif est de conserver suffisamment de signal pour comprendre le système.

## En production, 10 % peut déjà représenter énormément

Dans notre cas, nous avons choisi d’échantillonner fortement le trafic courant en production.

Un ordre de grandeur autour de 10 % du trafic normal apporte déjà beaucoup d’information sur une plateforme active.

Ce ratio n’est pas une règle universelle.

Sur un service qui reçoit dix requêtes par minute, 10 % peut être trop faible.

Sur une plateforme qui en reçoit des milliers par seconde, cela peut déjà représenter énormément de données.

Le bon ratio dépend du volume, de la diversité des parcours et de ce qu’on cherche à diagnostiquer.

Le point important est surtout d’accepter que **100 % n’est pas automatiquement la meilleure qualité d’observabilité**.

Un pipeline saturé par des données peu utiles observe moins bien qu’un pipeline correctement dimensionné avec un échantillon pertinent.

## "Toutes les erreurs + 10 % du reste" demande une nuance importante

Une politique très intuitive consiste à vouloir :

- toutes les erreurs ;
- environ 10 % du trafic normal.

C’est une bonne intention.

Mais sa mise en œuvre dépend fortement du moment où la décision de sampling est prise.

Avec du head sampling, la décision est prise au début de la trace.

À ce moment-là, on ne sait pas nécessairement encore si le traitement finira en erreur.

Un simple sampler probabiliste configuré à 10 % ne peut donc pas garantir à lui seul que toutes les traces en erreur seront conservées.

Pour garantir une politique réellement basée sur le résultat final de la trace, il faut prendre la décision plus tard, par exemple avec du tail sampling, ou utiliser une stratégie équivalente qui dispose d’assez d’information avant de décider.

C’est un détail d’architecture important.

Il y a une différence entre :

**"notre intention est de conserver toutes les erreurs"**

et :

**"notre pipeline garantit que toutes les traces en erreur sont conservées".**

Les deux phrases ne décrivent pas la même propriété.

## Centraliser la politique reste utile

Nous avons cherché à centraliser autant que possible la politique de sampling via l’instrumentation gérée autour de l’OpenTelemetry Operator.

Cela permet d’éviter que chaque service porte sa propre valeur, son propre mécanisme et son propre cycle de modification.

La centralisation simplifie énormément l’exploitation.

Mais elle ne dispense pas de comprendre le type de sampling effectivement appliqué.

Un paramètre centralisé mais mal compris reste un paramètre mal compris.

Cette remarque vaut d’ailleurs pour toute la stack d’observabilité.

L’unification de la configuration réduit la dispersion.

Elle ne remplace pas le modèle mental.

## Les trois budgets à surveiller

Avec le recul, je trouve utile de raisonner avec trois budgets distincts.

### Budget de volume

Combien de données sommes-nous prêts à transporter et stocker ?

Cela couvre le débit OTLP, les logs, les traces et les métriques dérivées.

### Budget de cardinalité

Combien de séries différentes pouvons-nous produire sans rendre le backend inefficace ou coûteux ?

C’est ici que les identifiants dynamiques deviennent dangereux.

### Budget de sensibilité

Quelles informations sommes-nous prêts à faire circuler dans la chaîne d’observabilité ?

Ce budget n’est pas financier. Il concerne le risque.

Ces trois budgets se croisent constamment.

Un champ peut être peu volumineux mais très cardinal.

Un autre peut être peu cardinal mais contenir une PII.

Un troisième peut être parfaitement sûr mais totalement inutile.

La télémétrie doit donc être gouvernée comme n’importe quelle autre donnée de production.

## Le bon objectif est une télémétrie utile, pas maximale

Je retiens surtout ceci de cette phase.

Plus d’observabilité n’est pas toujours mieux.

Plus de traces, plus de labels et plus de logs peuvent au contraire rendre le système moins exploitable.

Une plateforme mature sait aussi dire non à une donnée.

Elle sait qu’un attribut peut rester dans une trace mais ne pas devenir une métrique.

Elle sait qu’un log peut être utile sans contenir un identifiant personnel.

Elle sait qu’un échantillon peut donner suffisamment de visibilité sans stocker chaque requête.

Et surtout, elle comprend que ces choix doivent être faits avant que les backends commencent à souffrir.

Parce que lorsque la cardinalité explose, le prochain sujet n’est plus la qualité des traces.

Le prochain sujet devient la survie de la plateforme d’observabilité elle-même.

## Suite

[4/4 : OpenTelemetry est open source. Exploiter correctement la plateforme ne l’est pas](/2026-09-22-opentelemetry-exploiter-la-plateforme)

## Sources officielles

- [OpenTelemetry : sampling](https://opentelemetry.io/docs/concepts/sampling/)
- [OpenTelemetry Collector Contrib : tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)
- [Grafana Tempo : metrics-generator](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/)
- [Grafana Tempo : cardinalité du metrics-generator](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/cardinality/)
- [OpenTelemetry : sécurité](https://opentelemetry.io/docs/security/)
