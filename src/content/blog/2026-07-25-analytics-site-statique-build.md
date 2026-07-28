---
title: "Analytics sur site statique : le piège du build sans contexte"
description: "Le déploiement est vert. Le site répond. Les pages sont rapides. Pourtant, quelques jours plus tard, le tableau de bord analytics reste désespérément vide."
pubDate: 2027-01-19T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Le déploiement est vert. Le site répond. Les pages sont rapides. Pourtant, quelques jours plus tard, le tableau de bord analytics reste désespérément vide.

Ce scénario est plus fréquent qu’il n’y paraît sur les sites statiques modernes. Il ne vient pas forcément d’un bloqueur de publicité, d’une mauvaise balise ou d’un incident chez le fournisseur de mesure. La cause peut être beaucoup plus simple : la chaîne CI a construit une version parfaitement valide du site, mais sans les informations nécessaires pour activer sa télémétrie.

C’est un échec intéressant, parce qu’il révèle une confusion courante entre deux propriétés très différentes : **la validité technique d’un artefact** et **son adéquation au contexte dans lequel il sera exploité**.

## Le mauvais réflexe : traiter l’analytics comme une configuration d’exécution

Dans une application serveur, nous avons l’habitude de fournir la configuration au démarrage : variables d’environnement, secrets montés dans un conteneur, paramètres récupérés depuis un coffre. Le programme reste le même ; son comportement dépend du contexte d’exécution.

Un site statique inverse souvent ce modèle. Une grande partie du comportement est décidée avant le déploiement, pendant la compilation. Le générateur lit les sources, résout la configuration, produit du HTML et des bundles JavaScript, puis publie ces fichiers sur un CDN. Une fois l’artefact construit, il n’existe parfois plus aucun processus applicatif capable de lire une variable d’environnement.

Autrement dit, fournir un identifiant analytics uniquement à l’hébergement revient à donner une instruction à quelqu’un qui a déjà quitté la pièce.

Le problème est renforcé par le vocabulaire. Les frameworks utilisent volontiers des préfixes comme `PUBLIC_`, `NEXT_PUBLIC_` ou `VITE_`. Le mot « public » peut laisser croire que ces valeurs seront lues dans le navigateur depuis l’environnement de production. En pratique, il signifie généralement autre chose : **cette valeur peut être incorporée dans le code envoyé au navigateur**. Elle doit donc être disponible au moment où ce code est généré.

Cette nuance change toute la conception de la chaîne de livraison.

## Le bon modèle mental : compiler une décision, pas seulement du code

Un build statique ne transforme pas seulement des fichiers source en fichiers optimisés. Il compile aussi un ensemble de décisions :

- faut-il inclure le script de mesure ?
- quel identifiant public doit-il utiliser ?
- quelle bannière ou quel mode de consentement faut-il activer ?
- quelle URL canonique et quel environnement faut-il déclarer ?
- quelles fonctionnalités publiques doivent être exposées ?

L’artefact final est donc la combinaison de trois éléments :

> **sources + contexte de build + outils de compilation = comportement publié**

Si le contexte est incomplet, le build peut tout de même réussir. C’est même souvent souhaité en local : l’absence d’un identifiant de mesure ne doit pas empêcher un développeur d’afficher le site. Mais ce comportement tolérant devient dangereux en production. La compilation produit alors un artefact cohérent, rapide et déployable — simplement dépourvu de la capacité attendue.

Il faut donc distinguer deux catégories de configuration.

La première est la **configuration d’exécution**. Elle reste extérieure à l’artefact et peut changer sans reconstruction : identifiants d’accès serveur, endpoints internes, limites opérationnelles.

La seconde est la **configuration de fabrication**. Elle influence le contenu même de l’artefact : identifiants publics, URL du site, activation d’un module client, métadonnées, paramètres de télémétrie. La modifier exige de reconstruire.

L’analytics côté navigateur appartient presque toujours à cette seconde catégorie.

## Un pipeline vert ne prouve pas que le site observe quoi que ce soit

Les chaînes CI vérifient naturellement ce qu’elles savent mesurer : installation des dépendances, lint, tests, compilation, taille des bundles, parfois performance synthétique. Si le générateur accepte une variable absente, tous ces contrôles peuvent passer.

Le statut vert signifie alors seulement : « nous avons produit et publié des fichiers valides ». Il ne signifie pas : « le comportement métier attendu est présent ».

Cette limite ne se corrige pas en ajoutant aveuglément davantage de tests. Elle se corrige en définissant les **invariants de publication**. Pour un site dont la mesure d’audience est requise, un invariant peut être formulé ainsi :

> En production, l’artefact doit contenir une configuration analytics valide et émettre un signal observable, sous réserve du consentement de l’utilisateur.

Cette formulation comporte trois niveaux de preuve complémentaires.

### 1. Prouver que le contexte existe

La CI doit vérifier que les paramètres requis pour l’environnement ciblé sont présents avant la compilation. Elle ne doit toutefois jamais afficher leur contenu dans les journaux.

Tous les paramètres ne sont pas secrets. Un identifiant de propriété analytics est généralement visible dans le JavaScript servi au navigateur. Cela ne justifie pas pour autant de le disperser dans le dépôt : le gérer dans la configuration de déploiement permet de différencier les environnements, de garder une chaîne reproductible et de rendre son origine explicite.

### 2. Prouver que l’artefact a intégré la décision

Vérifier l’environnement de la CI ne suffit pas. Une variable peut exister sous un mauvais nom, être inaccessible à l’étape de build ou ne plus être consommée après une refactorisation.

Il faut inspecter le résultat produit, pas seulement les intentions du pipeline. Selon l’architecture, cela peut consister à vérifier la présence du composant de télémétrie, d’une balise attendue ou d’une configuration générée. L’objectif n’est pas de figer l’implémentation, mais de confirmer que l’artefact possède réellement la capacité attendue.

### 3. Prouver que la production émet un signal

Même un artefact correct peut être neutralisé par une politique de sécurité du contenu, un mécanisme de consentement, une erreur JavaScript ou une règle de routage. Une vérification après déploiement doit donc confirmer que la page publiée charge le dispositif prévu et qu’un événement de test peut être observé dans les conditions autorisées.

Cette dernière étape doit respecter la vie privée. Tester la télémétrie ne signifie pas contourner le consentement ni créer du trafic artificiel permanent. Il s’agit de vérifier le chemin complet, avec un événement synthétique identifiable ou un environnement de mesure dédié.

## La checklist utile : raisonner sur le cycle de vie de la donnée

Avant d’intégrer un outil analytics à un site statique, cinq questions suffisent à éviter la plupart des angles morts :

1. **Quand la valeur est-elle lue ?** Pendant le build, au chargement de la page ou par un serveur ?
2. **Où devient-elle visible ?** Dans l’artefact public, dans le navigateur ou uniquement dans l’infrastructure ?
3. **Que se passe-t-il si elle manque ?** Échec explicite, fonctionnalité désactivée ou comportement ambigu ?
4. **Quelle preuve conserve-t-on ?** Présence du contexte, inspection de l’artefact et test après déploiement couvrent-ils toute la chaîne ?
5. **Comment sépare-t-on les environnements ?** Les visites de prévisualisation, les tests et la production alimentent-ils des propriétés distinctes ou portent-ils au moins un marquage fiable ?

Cette checklist évite deux excès. Le premier consiste à traiter toute valeur comme un secret, au prix d’une complexité inutile. Le second consiste à considérer toute valeur publique comme anodine, sans gouvernance ni contrôle. Le bon critère n’est pas « secret ou non », mais **rôle dans le cycle de fabrication et d’exploitation**.

## Le problème dépasse largement l’analytics

Le même piège concerne les outils de support, les cartes, les paiements côté client, les drapeaux de fonctionnalités, les URL d’API publiques, les métadonnées sociales et les paramètres de consentement. Dès qu’une information est substituée pendant la compilation, le déploiement publie une décision déjà figée.

Cette réalité a aussi une conséquence opérationnelle : promouvoir exactement le même artefact entre environnements n’est pas toujours possible avec un pur site statique. Si chaque environnement exige une configuration client différente, il faut soit reconstruire l’artefact, soit introduire une véritable configuration d’exécution — par exemple un fichier chargé au démarrage dans le navigateur. Ce choix doit être explicite. Le laisser émerger au hasard des conventions du framework produit des systèmes difficiles à diagnostiquer.

L’enjeu n’est donc pas de mémoriser le préfixe d’une variable propre à un outil. Il est de savoir **à quel moment le comportement devient irréversible**.

Un pipeline fiable ne se contente pas de réussir une compilation et un déploiement. Il démontre que le contexte requis a été fourni, que l’artefact l’a effectivement intégré et que la production se comporte comme prévu. Pour un site statique, l’observabilité commence avant la mise en ligne : elle commence au moment du build.
