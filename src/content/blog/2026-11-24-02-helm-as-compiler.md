---
title: "Helm, DRY et le piège de la complexité invisible"
description: "Déplacer le rendu des charts vers la CI sans ignorer les contrats de release."
pubDate: 2026-12-09T04:00:00.000Z
language: fr
translationKey: 2026-11-24-02-helm-as-compiler
contentType: architecture-decision
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
tags:
  - GitOps
  - Kubernetes
  - Platform Engineering
  - OCI
featured: false
draft: false
relatedProjects: []
relatedArticles: []
---

Je ne cherche pas à supprimer Helm de l'écosystème Kubernetes. Je cherche à ne plus dépendre de son moteur de release pour distribuer toutes les briques de ma plateforme.

Un chart est un programme de génération de manifests. Ses entrées incluent les values, les capacités Kubernetes et parfois des fonctions qui consultent le cluster. Versionner le chart ne suffit donc pas à identifier son résultat.

## Le problème commence avec une ligne de YAML

Un hostname devrait être une information que je peux retrouver en quelques secondes. Pourtant, dans des plateformes que j'ai eu à analyser, la valeur finale peut dépendre d'un helper partagé, du namespace, du nom de release et de plusieurs exceptions historiques. Je ne reproduis pas ici le code de ces plateformes ; voici un exemple fictif :

```yaml
host: {{ include "platform.endpoint" . }}
```

Le jour où une équipe doit migrer un domaine, cette ligne ne lui indique ni le domaine actuel ni les autres applications affectées par une modification du helper. Il faut reconstituer le contexte de rendu. Une exception ajoutée pour un service peut changer la sortie d'autres releases. La revue de code porte alors sur un programme, alors que la décision métier concernait une adresse.

Le paradoxe est que la volonté de supprimer les valeurs écrites en dur finit par les déplacer dans des branches conditionnelles du chart. Le hardcoding n'a pas disparu. Il est devenu moins accessible.

## DRY ne veut pas dire factoriser tout ce qui se ressemble

DRY vise la duplication de connaissance. Deux hostnames semblables peuvent appartenir à deux contrats indépendants. Les générer par la même fonction impose une dépendance qui n'existait pas auparavant. AHA (Avoid Hasty Abstractions) invite à attendre que les invariants soient connus avant de créer cette dépendance.

Je préfère une répétition explicite de quelques paramètres à une abstraction dont personne ne peut prévoir les conséquences sans lancer le moteur. Cela ne signifie pas recopier chaque Deployment : les invariants structurels restent dans un composant commun, les différences légitimes restent des données.

Dans le hub de monitoring, une variante HA ne doit pas apparaître par hasard à cause d'une condition sur le nom du cluster. Elle constitue une version ou une ligne de distribution distincte. À composition équivalente, les environnements consomment le même paquet ; une petite couche de substitution Flux porte les adresses et la capacité.

## La revue doit porter sur le résultat

Le problème du rendu à la réconciliation est aussi un problème de contrôle : la CI peut approuver le chart et ses values sans avoir contrôlé exactement la sortie utilisée. Je veux conserver le rendu final comme artefact de revue, le valider et le publier sans le reconstruire. Les substitutions environnementales doivent ensuite être rendues et validées séparément. Si le paquet contient encore une HelmRelease, il faut traiter le rendu de cette release comme une étape supplémentaire : valider uniquement son enveloppe ne valide pas les workloads.

Kustomize peut reproduire les mêmes dérives si les overlays deviennent un langage de programmation implicite. Mon critère n'est donc pas le choix du moteur, mais la possibilité de lire, comparer et tester son résultat.

## Ce que je déplace en CI

Je fixe la version du chart et ses dépendances, les values et la version de Kubernetes ciblée. Je rends les manifests, valide leurs schémas et politiques, puis distribue le résultat.

```bash
helm template collector ./chart \
  --namespace monitoring \
  --kube-version 1.34.0 \
  --include-crds \
  --values values.yaml > rendered.yaml
```

Ce résultat doit encore être vérifié : certaines fonctions sont non déterministes et le rendu local ne reproduit pas une consultation réelle de l'API. Je compare deux rendus, puis je valide sur un cluster de test.

## Les pièges à ne pas masquer

Les hooks Helm ne deviennent pas automatiquement des migrations correctement orchestrées lorsqu'on applique le YAML rendu. Il faut les inventorier, retirer les hooks du paquet ordinaire et définir leur ordre et leur idempotence. Les CRDs exigent un cycle de vie explicite, notamment pour les changements de schéma et les conversions.

La gestion de propriété change aussi. Migrer une release existante vers une Kustomization exige un plan d'adoption, une fenêtre contrôlée et une vérification du comportement de suppression. Je ne désinstalle pas Helm à l'aveugle : cela pourrait supprimer les ressources actives.

## Quand garder Helm

Un opérateur livré par un éditeur avec des procédures de mise à niveau dépendantes de Helm peut justifier de conserver HelmRelease. Helm possède un historique de release et des mécanismes de remédiation utiles. Le choix dépend du contrat de support et du coût de migration.

Le critère est la capacité à identifier et tester ce que je vais distribuer, pas le nombre de contrôleurs supprimés.

## Expérience à reproduire

Comparer un chart simple rendu en CI et une HelmRelease avec les mêmes entrées. Introduire ensuite un hook, une CRD et une valeur générée pour observer ce qui cesse d'être équivalent. Ne promouvoir que les cas dont le contrat a été validé.

## Notre point de départ réel

Le hub AKS consomme déjà des manifests OCI contenant des HelmRelease. Nous avons séparé distribution et rendu, mais Helm reste actif pour certains composants. Le rendu en CI est une trajectoire, pas une réalisation que je revendique. Il faut tester chaque migration et préserver les contrats de support.

## Sources

- [Helm template](https://helm.sh/docs/helm/helm_template/)
- [Helm chart hooks](https://helm.sh/docs/topics/charts_hooks/)
- [Helm CRDs](https://helm.sh/docs/chart_best_practices/custom_resource_definitions/)
- [Flux HelmRelease](https://fluxcd.io/flux/components/helm/helmreleases/)
