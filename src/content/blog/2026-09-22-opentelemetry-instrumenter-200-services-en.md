---
title: "OpenTelemetry on 200 services: cover fast without rewriting fifteen years of code"
description: "On a brownfield application, the challenge was not perfect instrumentation service by service, but giving teams a shared framework they could apply quickly."
pubDate: 2026-09-22T21:30:00.000Z
language: en
translationKey: 2026-09-22-opentelemetry-instrumenter-200-services
contentType: field-note
pillar: observability
audience:
  - engineering-leads
  - engineers
  - cto-cio-ciso
tags:
  - OpenTelemetry
  - Observability
  - Brownfield
  - Developer Experience
  - Platform Engineering
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-09-22-opentelemetry-pourquoi-je-lai-propose-en
  - 2026-09-22-opentelemetry-cardinalite-pii-sampling-en
  - 2026-09-22-opentelemetry-exploiter-la-plateforme-en
---

A clean architecture on a slide is easy. Fitting it into about 200 services, some of them fifteen years old, is another matter.

There were several languages, historical shared libraries, and tests that were solid in places, lighter elsewhere. The application is fifteen years old; I am not going to pretend to be surprised.

The mistake would have been to turn the OpenTelemetry migration into a general rewrite. We would have won a nice three-year programme and probably lost the original goal.

So I proposed the opposite: define a sufficiently clean baseline, help teams apply it everywhere, then enrich the traces where it actually adds something.

## Coverage first

On the first pass, I mainly wanted to verify a few invariants:

- the service does emit its traces;
- context propagates;
- errors surface;
- HTTP and SQL calls are visible;
- logs can be correlated with the trace;
- instrumentation does not change the service’s behaviour.

It is not very glamorous, but with 200 services it already delivers a lot of value.

You can always spend three weeks designing the perfect span taxonomy for one business domain. Meanwhile the rest of the application stays blind.

On brownfield, I prefer correct, homogeneous coverage, then improve the places where teams genuinely need more context.

## A task force with R&D

We set up a small task force to help teams move fast without centralising all the work with a few people.

Concretely: workshops, examples in the different languages, support on the first PRs, deployment in dev, signal verification, then fixes with the team concerned.

The change stayed as small as possible. If we could add instrumentation without reorganising the service, we did not reorganise the service.

On an old application, that principle avoids a lot of drift: an observability migration is not an excuse to fix everything you dislike in the code at the same time.

## Cursor and Claude really helped

We also prepared a skill and instructions for the code assistants used by the teams.

The goal was not to ask Cursor or Claude "put OpenTelemetry in there" and take the answer as-is. That would mostly have produced 200 variants.

We gave them the way **we** wanted to integrate the SDK, the patterns to keep, and the kind of change that was acceptable.

Then the tool did the repetitive part very well: find the initialisation point, add the SDK, propagate context, reuse an already validated pattern.

The PR was still reviewed normally, then deployed in dev.

AI accelerated execution. It did not replace the convention or the validation.

## Traces found very concrete problems

The C++ part is probably the best example.

Once traces were in place, we found poorly managed SQL queries that were helping drive up RAM and CPU. We also saw repeated calls that should have been cached.

Nothing exotic. Exactly.

A metric easily shows that a service is consuming too much. The trace gives the path that explains why.

That is also what made R&D latch onto the topic fairly quickly. We were no longer asking them to instrument "for observability". They could use traces to understand behaviours they were already trying to explain.

## Business spans come later

Auto-instrumentation mainly gives a technical view: HTTP, SQL, external calls, errors.

We started adding a few business spans with the teams when it added meaning, but without trying to model everything from day one.

I prefer that pace.

When developers start using traces, they quickly see what is missing. That is when an extra span becomes useful, because it answers a real question.

Adding dozens of spans "just in case" before there is any usage mainly produces volume and conventions nobody follows for long.

## Correlate logs without rewriting everything

For logs, we patched a shared library to add what was needed for correlation with traces.

That avoids modifying every application by hand and, more importantly, letting each team choose its own format.

The gain during a debug session is fairly immediate: you start from a trace and find the logs for the same processing without reconstructing context from timestamps, the pod, or a business identifier.

That normalisation also surfaced a less pleasant topic: the more you enrich signals, the more you risk putting data that does not belong in an observability backend.

PII, bank account numbers, overly dynamic identifiers, database names... that is precisely where the next part becomes interesting.

## What I take from this phase

For a brownfield migration, I would keep the same method:

- decide the conventions once;
- make applying them simple;
- automate what is repetitive;
- validate service by service;
- favour coverage before finesse;
- add business context when a usage justifies it.

The result is not "200 perfectly instrumented services". That would be too neat a formulation to be true.

The useful result is a fleet that roughly speaks the same language, and teams able to improve instrumentation without starting from scratch every time.

The next difficulty arrives quickly: when you collect better, you can also collect far too much.

## Official sources

- [OpenTelemetry: instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/)
- [OpenTelemetry Operator: auto-instrumentation](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/)
- [OpenTelemetry: context and propagation](https://opentelemetry.io/docs/concepts/context-propagation/)
- [OpenTelemetry: traces](https://opentelemetry.io/docs/concepts/signals/traces/)
