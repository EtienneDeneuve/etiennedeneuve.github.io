---
title: "Un lab Flagger public : Gateway API, pas de magie make"
description: "J’ouvre un atelier Kind (Cilium, Envoy Gateway, Flagger) où les participants patchent du YAML pour voir qui décide vraiment du trafic."
pubDate: 2026-10-13T08:00:00.000Z
language: fr
translationKey: 2026-10-13-flagger-lab-kind-gateway-api
contentType: field-note
pillar: platform-engineering
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - Flagger
  - Gateway API
  - Progressive Delivery
  - Kubernetes
  - Platform Engineering
  - Open Source
featured: false
draft: false
relatedProjects:
  - flagger-demo-kind
relatedArticles: []
---

**Le dépôt GitHub passe public le 13 octobre 2026 à 10h30 (heure de Paris).**  
Lien : [EtienneDeneuve/flagger-demo-kind](https://github.com/EtienneDeneuve/flagger-demo-kind).

Kubernetes sait remplacer des pods. Il ne décide pas seul si une version **mérite** davantage de trafic.

Pour les ateliers plateforme, j’ai packagé un lab macOS — Kind, Cilium, Envoy Gateway, Flagger, Prometheus — avec une contrainte volontaire : les participants **appliquent des fichiers** sous `manifests/tp/`, au lieu de seulement taper `make good`.

Trois moments :

1. **Promotion** — patch Deployment V2, poids HTTPRoute 25→50, puis primary.
2. **Rollback** — pods Ready + 5xx HTTP sur la canary uniquement ; la primary reste intacte.
3. **A/B** — `apply` d’un Canary avec match `x-canary`, puis révision V4 pour la cohorte.

Le dépôt (MIT) : [EtienneDeneuve/flagger-demo-kind](https://github.com/EtienneDeneuve/flagger-demo-kind).  
Docs EN : [README.en.md](https://github.com/EtienneDeneuve/flagger-demo-kind/blob/main/README.en.md).  
Référence upstream : [Flagger Gateway API tutorial](https://docs.flagger.app/tutorials/gatewayapi-progressive-delivery).

Ce n’est **pas** un template production (pas de GitOps, pas de TLS, métrique app Podinfo pour la pédagogie). C’est un support pour faire lire la boucle de contrôle là où le trafic rencontre une nouvelle version.
