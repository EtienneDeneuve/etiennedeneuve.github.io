---
title: "GitOps : pourquoi séparer les versions d’infrastructure et d’images"
description: "Mélanger la version d’un chart et celle d’une image dans le même geste de promotion rend les rollbacks et les audits imprévisibles."
pubDate: 2026-08-11T09:00:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
tags:
  - GitOps
  - Kubernetes
  - Platform Engineering
  - Delivery
featured: true
draft: false
relatedProjects: []
relatedArticles: []
---

Dans beaucoup de plateformes GitOps, un seul commit fait deux choses à la fois : il change la version de l’infrastructure (chart, kustomization, policy) et la version de l’image applicative. Le déploiement passe au vert. L’équipe considère la promotion terminée.

Puis un incident arrive. Faut-il revenir à l’image précédente, au chart précédent, ou aux deux ? Personne ne sait facilement quels changements étaient couplés par accident et lesquels étaient nécessaires ensemble. L’historique Git devient une chronique, pas une API de promotion.

GitOps n’est pas en cause : le mélange de deux cycles de version l’est. Ils n’ont pas la même sémantique, ni le même rythme, ni le même risque.

## Deux objets, deux cadences

Une **image** change souvent : correctif, feature, rebuild. Son risque est surtout comportemental : régression applicative, dépendance, configuration runtime.

Une **version d’infrastructure** change moins souvent : chart, CRD, NetworkPolicy, valeurs de capacité, hooks de déploiement. Son risque est structurel : incompatibilité d’API, dérive de droits, changement de surface d’attaque, comportement du contrôleur.

Les promouvoir dans le même geste crée trois confusions :

1. **Atomicité** : on croit avoir livré « une version » alors qu’on a livré deux décisions indépendantes.
2. **Rollback** : revenir d’un commit peut annuler trop ou pas assez.
3. **Audit** : on ne sait plus si un environnement diffère par le code, par le packaging, ou par la plateforme.

## L’erreur habituelle : un tag pour tout

Une convention fréquente consiste à taguer « la release » et à faire pointer infrastructure et image vers le même identifiant. C’est confortable pour le storytelling produit. C’est fragile pour l’exploitation.

Dès qu’une image doit être corrigée sans toucher au chart, ou qu’un chart doit être ajusté sans rebuild applicatif, la convention se fissure. On crée alors des tags spéciaux, des overrides manuels, des branches d’exception, exactement ce que GitOps était censé éviter.

Un tag de release peut rester une API utile pour les humains. Il ne doit pas forcer l’identité technique de tous les artefacts.

## Une approche plus saine : des canaux de promotion explicites

Je sépare au minimum trois canaux :

- **image** : digests ou tags immuables, promus environnement par environnement ;
- **infrastructure** : versions de chart / overlays, promues avec leurs propres critères ;
- **composition** : l’état désiré d’un environnement, qui référence explicitement une version d’image et une version d’infra.

La composition est le seul endroit où les deux se rencontrent. Elle dit : « en staging, image `a@sha` + chart `1.4.2` ». Elle ne prétend pas que `a` et `1.4.2` sont la même chose.

Dans Flux, cette séparation peut tenir dans un même `HelmRelease`. La version du chart appartient à `chart.spec.version`; le digest de l’image reste une valeur du chart. Les noms sous `values.image` dépendent du contrat du chart :

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: checkout
  namespace: production
spec:
  interval: 10m
  chart:
    spec:
      chart: checkout
      version: "1.4.2"
      sourceRef:
        kind: HelmRepository
        name: applications
        namespace: flux-system
  values:
    image:
      repository: registry.example.com/checkout
      digest: sha256:8d1f...
```

Une promotion applicative ne modifie alors que `values.image.digest`. Une évolution du packaging ne modifie que `chart.spec.version`. Lorsqu’une version de chart exige une version minimale de l’application, une validation CI doit vérifier cette compatibilité avant de fusionner la nouvelle composition.

Les canaux alpha / bêta / stable peuvent exister pour chacun, mais leurs critères diffèrent. Une image peut être stable après des tests applicatifs. Un chart peut exiger une validation de migration, un dry-run de CRD, ou une fenêtre de changement plateforme.

## Ce que la séparation rend possible

### Promotions indépendantes

Corriger une régression applicative sans rouvrir le débat sur le chart. Ajuster une limite de ressources sans rebuild. Tester une nouvelle version d’infra avec une image déjà connue.

### Rollbacks ciblés

La séparation permet de revenir sur une seule référence de l’état désiré. Elle ne restaure ni les données migrées, ni une CRD devenue incompatible, ni les effets externes du déploiement. Le rollback reste soumis au contrat de compatibilité et au comportement du contrôleur : avec l’auto-sync Argo CD, par exemple, un rollback direct n’est pas disponible tant que la synchronisation automatique reste activée.

### Contrats de compatibilité

On peut enfin exprimer des règles utiles : cette version de chart exige telle gamme d’images ; cette image refuse tel schéma de config. Sans séparation, ces contrats restent informels.

### Audits plus courts

Face à une régression ou à une différence entre environnements, la première question n’est plus « qu’est-ce qui a changé dans le gros commit ? ». C’est « image, infra, ou les deux ? ». Le mot *drift* reste réservé à l’écart entre l’état désiré et l’état observé.

## Une checklist de conception

Avant de figer une convention GitOps, je vérifie :

- une promotion d’image peut-elle se faire sans toucher à l’infra ?
- une promotion d’infra peut-elle se faire sans rebuild d’image ?
- un environnement peut-il référencer clairement les deux versions ?
- un rollback peut-il cibler un seul canal ?
- les tags humains (release notes, communication) sont-ils distincts des identifiants techniques ?
- les critères alpha / bêta / stable sont-ils définis par canal, pas par slogan unique ?

Si la réponse à plusieurs de ces points est non, la plateforme vend de la simplicité apparente au prix de l’opérabilité réelle.

La migration ne demande pas de big bang. Sur un environnement, un produit, on remplace le tag unique par deux champs explicites (image et chart), et on regarde ce que ça change au prochain incident. La convention s’étend ensuite.

## Au-delà de Kubernetes

Le même schéma apparaît dès qu’une plateforme compose un runtime et un artefact : agents CI et images d’outils, Terraform modules et versions de providers, packages et configurations déployées. Partout, **mélanger cycle de packaging et cycle de contenu** produit des promotions spectaculaires et des rollbacks confus.

Séparer les versions d’infrastructure et d’images n’ajoute pas de complexité. Cela rend visible la complexité qui existait déjà, et qu’un seul tag dissimulait.

## Sources officielles

- [Flux : spécification et remédiation des HelmRelease](https://fluxcd.io/flux/components/helm/helmreleases/)
- [Argo CD : synchronisation automatique et rollback](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/)
