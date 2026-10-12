---
title: "OpenTelemetry: 400,000 databases, cardinality, and other telemetry traps"
description: "A dimension that is useful in a trace can become a disaster in a metric. Field notes on cardinality, PII, and sampling."
pubDate: 2026-09-22T21:40:00.000Z
language: en
translationKey: 2026-09-22-opentelemetry-cardinalite-pii-sampling
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
  - 2026-09-22-opentelemetry-pourquoi-je-lai-propose-en
  - 2026-09-22-opentelemetry-instrumenter-200-services-en
  - 2026-09-22-opentelemetry-exploiter-la-plateforme-en
---

We had put the database name into the C++ traces.

On paper, it was a good idea. To diagnose a SQL call, knowing which database is involved helps a lot.

The detail that changes everything: there are about 400,000 of them.

And behind the traces, Tempo was also generating metrics sent to VictoriaMetrics.

That is how information that is useful in a trace became a very effective way to explode cardinality.

## A trace and a metric do not have the same contract

A trace can hold a lot of context. That is even its point.

A metric works differently. A series is defined by its name and its labels. If a label can take hundreds of thousands of values, you create an enormous number of series.

So the problem was not "the database name is bad data".

The problem was letting that dynamic data reach metric generation as if it had the same value everywhere.

It is a fairly classic trap with modern pipelines: you think about the signal you produce, not always about the transformations it undergoes afterwards.

A request UUID, a user identifier, a generated job name, or a full URL can be very useful in a trace. As a metric label, that is another story.

## Cardinality is handled across the whole chain

In our case, we revisited how database-related information was processed to stop it producing an unbounded metric dimension.

I am deliberately keeping the implementation detail for an update, because I prefer to revalidate exactly the fix that was applied rather than tell an approximate version.

The principle itself is simple: **a piece of data does not need the same level of detail in traces, logs, and metrics**.

That is probably one of the most useful mental-model shifts with OpenTelemetry.

You are not only defining a trace schema. You are defining data that may be enriched, filtered, transformed, sampled, and sent to several backends.

You have to look at the entire chain.

## Dynamic IDs are suspect by default

After that incident, highly dynamic attributes became much easier to spot.

A few obvious candidates:

- request identifiers;
- users;
- UUIDs;
- ephemeral job names;
- paths or URLs containing IDs;
- generated resource names;
- identifiers for databases, files, or very numerous treatments.

I am not saying you should remove them everywhere. In a trace, they can be essential.

I am saying you need to know where they end up.

The difference between "I can find this request" and "I create a series for every request" is fairly important.

## Enriching logs also surfaces PII

The other topic that arrives quickly when you improve correlation is sensitive data.

To connect logs and traces, we modified a shared library and added the necessary context. Very practical for debugging, but it also increases the amount of information in circulation.

So we added filtering at two levels:

- in the shared libraries when we control log production;
- in collection, as a second safety net.

We filter PII, bank account numbers, and other sensitive data in particular with rules and regular expressions.

Regex is obviously not a security policy on its own. It does not guess that free text contains personal information, and it does not know the business sensitivity of an internal field.

The best filter is still not to produce the data when it is not needed.

But on brownfield, having a second control in the pipeline avoids a few nasty surprises.

## Keeping everything does not necessarily improve observability

Traces then raise another question: how many should you keep?

In production, we sample current traffic. An order of magnitude around 10% already gives a lot of material on an active platform.

That number is not a universal recommendation. Ten percent of a small service and ten percent of a heavily loaded platform do not represent the same volume at all.

The important idea is elsewhere: storing 100% of traces is not automatically a sign of maturity.

It increases network, storage, SaaS-side ingestion, and load on the backends. If you end up degrading the pipeline or limiting retention because you wanted to keep everything, you have gained nothing.

## The "all errors + 10% of the rest" case

That is the policy we naturally aim for: keep the errors, then a sample of normal traffic.

You just need to be precise about what the configuration actually guarantees.

With probabilistic head sampling, the decision is taken at the start of the trace. You do not necessarily know yet whether the processing will end in an error. A simple "10%" therefore cannot guarantee that you will keep 100% of the traces that will eventually finish in error.

To get that property, you need a later decision, typically tail sampling, or an equivalent mechanism.

In our setup, sampling is centralised around the instrumentation managed by the Operator. That is convenient for evolving the policy without modifying services one by one. But centralising a setting does not change its semantics.

This is a point I prefer to make explicit: there is a difference between the policy you want and the one the pipeline actually guarantees.

## Three budgets rather than one

Since then, I look at telemetry with three budgets.

**Volume**: how much data can we transport and store without degrading the platform or making the bill absurd?

**Cardinality**: how many different dimensions can we create before the backends start to suffer?

**Sensitivity**: which data is actually allowed to leave the application and be copied into observability systems?

These three budgets do not overlap.

A field can be very low volume and kill cardinality. Another can be low cardinality but contain PII. A third can be perfectly safe and simply useless.

OpenTelemetry greatly simplifies transport. It does not remove the need to model the data.

## The useful criterion: does this signal really help?

Since this migration, I am more wary of "we have it, so we keep it".

An observability data point has a collection cost, a storage cost, a security cost, and a query cost. It has to bring something in return.

A database name can remain very useful in a detailed trace and never become a metric label. Personal information may never leave the service. A normal trace can be sampled without losing the general understanding of the system.

It is less spectacular than "collect everything", but much more operable.

And once those volumes are under control, you still have to run the backends that receive them correctly.

## Official sources

- [OpenTelemetry: sampling](https://opentelemetry.io/docs/concepts/sampling/)
- [OpenTelemetry Collector Contrib: tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)
- [Grafana Tempo: metrics-generator](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/)
- [Grafana Tempo: metrics-generator cardinality](https://grafana.com/docs/tempo/latest/metrics-from-traces/metrics-generator/cardinality/)
- [OpenTelemetry: security](https://opentelemetry.io/docs/security/)
