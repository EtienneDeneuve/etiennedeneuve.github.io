---
title: "Why I proposed OpenTelemetry during a Dynatrace migration"
description: "The client was migrating to Dynatrace, but the C++ instrumentation had to be replaced. I proposed OpenTelemetry to avoid gluing the application to a new backend."
pubDate: 2026-09-22T21:20:00.000Z
language: en
translationKey: 2026-09-22-opentelemetry-pourquoi-je-lai-propose
contentType: architecture-decision
pillar: observability
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - OpenTelemetry
  - Observability
  - Dynatrace
  - Grafana Alloy
  - Platform Engineering
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-09-22-opentelemetry-instrumenter-200-services-en
  - 2026-09-22-opentelemetry-cardinalite-pii-sampling-en
  - 2026-09-22-opentelemetry-exploiter-la-plateforme-en
  - 2026-07-06-observabilite-contrat-testable
---

> Series **OpenTelemetry in production**, 1/4. Next: [instrument about 200 services without rewriting the application](/en/thinking/2026-09-22-opentelemetry-instrumenter-200-services-en/).

The starting context was fairly simple: the client was migrating to Dynatrace, Prometheus and Grafana were already in place, and a significant part of the application was in C++.

The problem showed up with instrumentation. The proprietary SDK used until then on the C++ side had to be replaced. So we needed to touch code to keep the traces.

At that point, two options were possible: go straight onto the new backend’s SDK, or use the change as an opportunity to decouple instrumentation from storage.

I proposed OpenTelemetry.

Not to challenge Dynatrace. The client had chosen its path and my role was not to re-decide it. The idea was more pragmatic: if we already have to touch the code, we might as well avoid doing the same operation again at the next tool change, contract change, or cost model change.

## The point was not to replace Dynatrace

Dynatrace was supposed to receive the expected logs, metrics, and traces. That did not change.

On the other hand, I saw no value in the application knowing that those signals were destined for Dynatrace.

That is where OpenTelemetry becomes interesting. Applications emit against a shared contract. The platform collects, transforms, and routes. The backend remains an operations choice.

That does not make the tools interchangeable. Queries, dashboards, alerting, retention, and proprietary features stay specific. Moving from Dynatrace to Tempo is obviously not a URL change.

But re-instrumenting 200 services just to change the destination is a different problem. That is the one I wanted to avoid.

## Do not break what already works

Prometheus and Grafana were already used to operate the platform. There was no reason to throw that away at the start of the migration.

Same for Splunk: some log dashboards still existed and had not been migrated. So it had to stay in the loop until those usages were picked up elsewhere.

The proposed trajectory looked like this:

~~~mermaid
flowchart LR
    A[Applications et runtimes] --> B[OpenTelemetry]
    B --> C[Grafana Alloy]

    C --> D[VictoriaMetrics]
    C --> E[Tempo]
    C --> F[Loki]
    C --> G[Dynatrace]
    C --> H[Splunk pendant la transition]

    D --> I[Grafana]
    E --> I
    F --> I
~~~

The diagram is intentionally simplified. Alloy is not deployed the same way everywhere, and not every signal follows exactly the same path.

The rule itself is simple: a destination receives the data it needs. Not everything, everywhere, by default.

Dynatrace receives what the client’s target expects. Grafana stays useful for platform teams. Splunk continues only while the dashboards that depend on it are migrated.

## Why Alloy

We could have stayed on the upstream OpenTelemetry Collector. I preferred to propose Alloy because the need already went beyond OTLP.

We had to make OpenTelemetry, Prometheus metrics, and several technical sources coexist. Alloy provides the required components in the same configuration model, including useful exporters for Azure, SQL Server, or MongoDB.

It also deploys fairly freely: DaemonSet, Deployment, gateway, multiple instances with different roles. The web UI helps understand what is running and how components are connected.

This is not a general claim about Alloy. In this specific context, it mainly avoided stacking a different tool for each source.

## Brownfield: open first, tighten later

On a greenfield platform, I would start much more closed: few attributes, few destinations, cardinality and sensitive-data rules defined from day one.

On a fifteen-year-old application, doing that bluntly is risky.

A field you think is useless may feed a dashboard nobody mentioned. A historical source may still serve a team. Cutting before you have observed the usages is mostly a good way to create a migration incident.

So the approach was more like:

1. standardize emission;
2. make the flows visible;
3. keep known usages;
4. migrate the consumers;
5. remove what no longer has a use;
6. tighten progressively.

It looks less pretty for a few weeks, but it is much healthier than an observability big bang.

## What I was really trying to achieve

The goal was not to build a "Grafana stack".

I was looking to separate four responsibilities:

- the application describes what it does;
- the platform collects and routes;
- the backends store and operate;
- the client chooses the tools it wants to keep.

That separation leaves more room for what comes next. It also lets you answer the Dynatrace migration without losing the existing Grafana setup or turning application code into a catalogue of vendor SDKs.

The real work started right after: we had to apply this model to about 200 services without rewriting fifteen years of code.

## Next

[2/4: OpenTelemetry on 200 services: cover fast without rewriting fifteen years of code](/en/thinking/2026-09-22-opentelemetry-instrumenter-200-services-en/)

## Official sources

- [OpenTelemetry: Collector architecture](https://opentelemetry.io/docs/collector/architecture/)
- [OpenTelemetry Operator for Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/operator/)
- [Grafana Alloy: how it works](https://grafana.com/docs/alloy/latest/introduction/how-alloy-works/)
- [Grafana Alloy: Prometheus components](https://grafana.com/docs/alloy/latest/reference/components/prometheus/)
