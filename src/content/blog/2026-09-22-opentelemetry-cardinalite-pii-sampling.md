---
title: "OpenTelemetry : 400 000 bases, cardinalité et autres pièges de télémétrie"
description: "Une dimension utile dans une trace peut devenir un désastre dans une métrique. Retour terrain sur la cardinalité, les PII et le sampling."
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

> Série **OpenTelemetry en production**, 3/4. Le précédent : [instrumenter environ 200 services](/2026-09-22-opentelemetry-instrumenter-200-services). La suite : [exploiter la plateforme](/2026-09-22-opentelemetry-exploiter-la-plateforme).

On avait mis le nom de la base dans les traces C++.

Sur le papier, c’était une bonne idée. Pour diagnostiquer un appel SQL, savoir quelle base est concernée aide beaucoup.

Le détail qui change tout : il y en a environ 400 000.

Et derrière les traces, Tempo générait aussi des métriques envoyées vers VictoriaMetrics.

C’est comme ça qu’une information utile dans une trace est devenue un très bon moyen de faire exploser la cardinalité.

## Une trace et une métrique n’ont pas le même contrat

Une trace peut contenir beaucoup de contexte. C’est même son intérêt.

Une métrique fonctionne autrement. Une série est définie par son nom et ses labels. Si un label peut prendre des centaines de milliers de valeurs, on crée énormément de séries.

Le problème n’était donc pas "le nom de la base est une mauvaise donnée".

Le problème était de laisser cette donnée dynamique arriver jusqu’à la génération de métriques comme si elle avait la même valeur partout.

C’est un piège assez classique avec les pipelines modernes : on pense au signal que l’on produit, pas toujours aux transformations qu’il subit ensuite.

Un UUID de requête, un identifiant utilisateur, un nom de job généré ou une URL complète peuvent être très utiles dans une trace. Comme label de métrique, c’est une autre histoire.

## La cardinalité se traite dans toute la chaîne

Dans notre cas, on a repris le traitement de l’information liée aux bases pour éviter qu’elle produise une dimension métrique non bornée.

Je garde volontairement le détail d’implémentation pour une mise à jour, parce que je préfère revalider exactement la correction appliquée plutôt que raconter une version approximative.

Le principe, lui, est simple : **une donnée n’a pas besoin d’avoir le même niveau de détail dans les traces, les logs et les métriques**.

C’est probablement l’un des changements de modèle mental les plus utiles avec OpenTelemetry.

On ne définit pas seulement un schéma de trace. On définit une donnée qui va potentiellement être enrichie, filtrée, transformée, échantillonnée et envoyée vers plusieurs backends.

Il faut regarder la chaîne entière.

## Les IDs dynamiques sont suspects par défaut

À partir de cet incident, les attributs très dynamiques sont devenus beaucoup plus faciles à repérer.

Quelques candidats évidents :

- identifiants de requête ;
- utilisateurs ;
- UUID ;
- noms de jobs éphémères ;
- chemins ou URLs contenant des IDs ;
- noms de ressources générés ;
- identifiants de bases, fichiers ou traitements très nombreux.

Je ne dis pas qu’il faut les supprimer partout. Dans une trace, ils peuvent être essentiels.

Je dis qu’il faut savoir où ils finissent.

La différence entre "je peux retrouver cette requête" et "je crée une série pour chaque requête" est assez importante.

## Enrichir les logs fait aussi remonter les PII

L’autre sujet qui arrive vite quand on améliore la corrélation, ce sont les données sensibles.

Pour relier logs et traces, on a modifié une bibliothèque commune et ajouté le contexte nécessaire. Très pratique pour le debug, mais ça augmente aussi la quantité d’information qui circule.

On a donc ajouté du filtrage à deux niveaux :

- dans les bibliothèques communes quand on contrôle la production du log ;
- dans la collecte, comme deuxième filet.

On filtre notamment des PII, des RIB et d’autres données sensibles avec des règles et des expressions régulières.

La regex n’est évidemment pas une politique de sécurité à elle seule. Elle ne devine pas qu’un texte libre contient une information personnelle, et elle ne connaît pas la sensibilité métier d’un champ interne.

Le meilleur filtre reste encore de ne pas produire la donnée quand elle n’est pas nécessaire.

Mais sur du brownfield, avoir un deuxième contrôle dans le pipeline évite quelques mauvaises surprises.

## Tout garder n’améliore pas forcément l’observabilité

Les traces posent ensuite une autre question : combien en garder ?

En production, on échantillonne le trafic courant. Un ordre de grandeur autour de 10 % donne déjà beaucoup de matière sur une plateforme active.

Ce chiffre n’est pas une recommandation universelle. Dix pour cent d’un petit service et dix pour cent d’une plateforme très chargée ne représentent pas du tout le même volume.

L’idée importante est ailleurs : stocker 100 % des traces n’est pas automatiquement un signe de maturité.

Ça augmente le réseau, le stockage, l’ingestion côté SaaS et la charge sur les backends. Si on finit par dégrader le pipeline ou limiter la rétention parce qu’on a voulu tout conserver, on n’a rien gagné.

## Le cas "toutes les erreurs + 10 % du reste"

C’est la politique qu’on vise naturellement : garder les erreurs, puis un échantillon du trafic normal.

Il faut juste être précis sur ce que la configuration garantit réellement.

Avec du head sampling probabiliste, la décision est prise au début de la trace. On ne sait pas forcément encore si le traitement finira en erreur. Un simple "10 %" ne peut donc pas garantir qu’on conservera 100 % des traces qui termineront en erreur.

Pour obtenir cette propriété, il faut une décision plus tardive, typiquement du tail sampling, ou un mécanisme équivalent.

Chez nous, le sampling est centralisé autour de l’instrumentation gérée par l’Operator. C’est pratique pour faire évoluer la politique sans modifier les services un par un. Mais centraliser un réglage ne change pas sa sémantique.

C’est un point que je préfère expliciter : il y a une différence entre la politique qu’on veut et celle que le pipeline garantit vraiment.

## Trois budgets plutôt qu’un seul

Depuis, je regarde la télémétrie avec trois budgets.

**Le volume** : combien de données peut-on transporter et stocker sans dégrader la plateforme ni rendre la facture absurde ?

**La cardinalité** : combien de dimensions différentes peut-on créer avant que les backends commencent à souffrir ?

**La sensibilité** : quelles données ont réellement le droit de sortir de l’application et d’être copiées dans les systèmes d’observabilité ?

Ces trois budgets ne se recouvrent pas.

Un champ peut être très peu volumineux et tuer la cardinalité. Un autre peut être peu cardinal mais contenir une PII. Un troisième peut être parfaitement sûr et simplement inutile.

OpenTelemetry simplifie beaucoup le transport. Il ne dispense pas de modéliser les données.

## Le critère utile : est-ce que ce signal aide vraiment ?

Depuis cette migration, je me méfie davantage du "on l’a, donc on le garde".

Une donnée d’observabilité a un coût de collecte, de stockage, de sécurité et de requête. Elle doit apporter quelque chose en face.

Le nom d’une base peut rester très utile dans une trace détaillée et ne jamais devenir un label de métrique. Une information personnelle peut ne jamais sortir du service. Une trace normale peut être échantillonnée sans perdre la compréhension générale du système.

C’est moins spectaculaire que "collect everything", mais beaucoup plus exploitable.

Et une fois ces volumes sous contrôle, il reste encore à faire tourner correctement les backends qui les reçoivent.

## Suite

[4/4 : OpenTelemetry en production : la stack open source qu’il faut quand même opérer](/2026-09-22-opentelemetry-exploiter-la-plateforme)

## Sources officielles

- [OpenTelemetry : sampling](https://opentelemetry.io/docs/concepts/sampling/)
- [OpenTelemetry Collector Contrib : tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)
- [Grafana Tempo : metrics-generator](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/)
- [Grafana Tempo : cardinalité du metrics-generator](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/cardinality/)
- [OpenTelemetry : sécurité](https://opentelemetry.io/docs/security/)
