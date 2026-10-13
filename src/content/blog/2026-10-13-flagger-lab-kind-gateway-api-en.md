---
title: "A public Flagger lab: Gateway API, not make magic"
description: "I’m publishing a Kind workshop (Cilium, Envoy Gateway, Flagger) where attendees patch YAML to see who actually decides traffic."
pubDate: 2026-10-13T08:00:00.000Z
language: en
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
draft: true
relatedProjects:
  - flagger-demo-kind
relatedArticles: []
---

Kubernetes can replace pods. It does not decide alone whether a revision **deserves** more traffic.

For platform workshops I packaged a macOS lab — Kind, Cilium, Envoy Gateway, Flagger, Prometheus — with one deliberate constraint: attendees **apply files** under `manifests/tp/` instead of only running `make good`.

Three beats:

1. **Promote** — patch Deployment V2, HTTPRoute weights 25→50, then primary.
2. **Rollback** — Ready pods + HTTP 5xx on the canary only; primary stays safe.
3. **A/B** — `apply` a Canary with `x-canary` match, then a V4 revision for the cohort.

Repo (MIT): [EtienneDeneuve/flagger-demo-kind](https://github.com/EtienneDeneuve/flagger-demo-kind).  
English docs: [README.en.md](https://github.com/EtienneDeneuve/flagger-demo-kind/blob/main/README.en.md).  
Upstream: [Flagger Gateway API tutorial](https://docs.flagger.app/tutorials/gatewayapi-progressive-delivery).

This is **not** a production template (no GitOps, no TLS, Podinfo app metrics for teaching). It is a way to read the control loop where traffic meets a new revision.
