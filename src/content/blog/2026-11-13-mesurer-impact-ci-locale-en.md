---
title: "Local CI: measure properly before claiming a win"
description: "Our pilot removed hosted test jobs, but raw totals are misleading. A field report on measuring runner usage, feedback, validation quality and cost responsibly."
pubDate: 2026-11-13T07:30:00.000Z
language: en
translationKey: 2026-11-13-mesurer-impact-ci-locale
contentType: field-note
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - CI/CD
  - Developer Experience
  - GitHub Actions
  - Engineering Metrics
  - Platform Engineering
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre-en
  - 2026-10-16-deplacer-ci-sur-mac-devenv-en
  - 2026-10-23-github-garde-dernier-mot-ci-locale-en
  - 2026-10-30-tester-changement-sans-tout-relancer-en
  - 2026-11-06-retour-experience-ci-locale-ia-en
  - 2026-10-03-provisioning-mac-pas-probleme-mdm-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

At first, we simply wanted to stop running the same checks repeatedly on GitHub runners.

AI-assisted code production accelerated, but every small change could still restart a long remote validation chain. We moved part of CI to developer workstations so that corrections could happen while the context was fresh.

A few weeks later, an initial GitHub Actions export appeared to show a spectacular result. The temptation was obvious: a before-and-after table, a large percentage and a conclusion about productivity.

**We chose not to publish that percentage.**

Not because we made the data up. A mathematically correct calculation on incomplete data is still a bad measurement. And accurate runner consumption does not, by itself, establish that a team is shipping better software.

This is what changed in **one small internal pilot project**, what we actually observed, and the protocol we are using to determine whether this architecture deserves broader adoption.

## First, what we can verify without statistics

The pilot monorepo combines Go, Vue, PostgreSQL and a Rust component. Previously, pull requests triggered several hosted jobs: tests, typechecks, integrations and application-specific validations. Each runner brought its own setup costs and, sometimes, repeated a check already available on the workstation.

We separated the responsibilities.

**Pre-commit** remains short. **PR-ready validation** runs in a reproducible local environment with devenv, including PostgreSQL integrations when the change requires them. Test selection is driven by affected components and dependencies, not only file extensions.

GitHub still decides whether a change can merge: a GitHub App publishes a result for the **exact commit SHA**, and the ruleset requires that status. E2E checks have their own contract; Linux image builds, previews and releases stay remote when their properties require it.

On **9 October 2026**, we removed redundant hosted PR test jobs.

**That is verifiable in the repository and commit history without relying on any claimed percentage.**

There is also a trust boundary: a green status published from a workstation is **not independent attestation** that tests actually ran. GitHub App permissions, possible ruleset bypasses and sensitive changes still matter.

## The first trap: measuring an export, not all activity

Our initial extraction suggested a very large drop in GitHub Actions job-minutes across two eleven-day windows.

We found three methodological problems.

**Completeness.** The “before” export contained exactly **1,000 runs**. That is the search limit of the GitHub Actions API when applying filters. Ordinary pagination cannot get past it. We had not proven that the entire window had been collected.

**Activity mix.** We observed **112 active PR branches** in one window and **26** in the other. Those are not comparable workloads. Dividing by branch count would not solve anything: a branch is not a reliable unit of work.

**The transition.** Part of the “before” window included a shadow period when old and new CI ran together to validate parity. That was responsible engineering, but a poor baseline for permanent savings.

We retain those first numbers in the audit working papers as **unverified descriptive observations**. They do not belong in this article's headline or in any financial extrapolation.

## Collecting runs without silently losing data

We are preparing equal-length windows, ideally **28 full days**, outside the shadow period. Dates will be fixed using the actual cutover history, in UTC, with an inclusive start and exclusive end.

Why 28 days? To include the same number of each weekday. It is not a magical cure for seasonality, but it is more defensible than choosing convenient date ranges after seeing the result.

Our collector automatically splits searches that approach GitHub's 1,000-result cap. Every segment records the expected and fetched counts. Any mismatch stops the calculation.

For each run, we include **every job attempt**, including reruns, failed jobs and cancellations that used compute. A job that never started did not consume runner time.

The first metric is simply:

\`Runner execution minutes = sum(job completion - job start) / 60\`

That is the **sum of job durations**, not the wall-clock duration of several parallel jobs, and it is not the amount GitHub billed.

Only after proving the extraction complete can we responsibly compare those volumes.

## Normalize pull-request work, not releases

Even a complete dataset does not account for changing levels of activity.

First, we need a **complete inventory of eligible pull requests**, including PRs that consumed **zero hosted minutes** after the change. Counting only PRs that have GitHub Actions runs would systematically hide the very effect we are looking for.

We then classify each PR **once** by the dominant risk and required checks: documentation, backend, frontend, database, Rust or shared/multi-component changes.

For each category:

\`Hosted minutes per PR = attributed validation minutes / number of eligible PRs\`

But if the baseline contained many PostgreSQL migrations while the later window mostly involved documentation, even those averages would be misleading.

So we **freeze the category weights using the baseline population** and apply the very same weights to both periods:

\`Standardized measure = sum(category weight × hosted minutes per PR in category)\`

Why fixed weights? To avoid crediting the CI architecture for a week in which the team simply worked on less demanding changes.

If a category is absent in either period, the PR population is incomplete, or check parity is not established, **we refuse to produce a standardized percentage**. We report the strata and say that the comparison is insufficient.

Releases, previews and security scans are **not** normalized per PR. They have their own units: releases and components built, requested previews and actual scan coverage.

## Feedback latency needs its own data

We have a small targeted benchmark from **2 October 2026**, using the same Go test command:

| Environment | Observed execution |
| --- | ---: |
| Simplified GitHub runner, warm cache | 1m 36s |
| Local workstation, warm cache | 38.63s |

That is encouraging. This particular command returned faster on a warm workstation.

It is not a representative distribution across the repository, though. The historical remote job also performed other checks: comparing its entire runtime with this one local command would be dishonest.

To quantify feedback, we need the interval from a code change to **the first actionable result**, including median, p90, cache state and type of check. Separately, we need to measure how long it takes for a PR to become mergeable.

A runner-minute avoided is not automatically a minute of developer waiting recovered.

## What about actual costs?

That takes a third dataset: **GitHub's detailed Billing export**, by repository, runner category and period. Without it, multiplying runtime by a list price does not establish savings.

The other side also matters: maintaining devenv, workstation compute, onboarding, status publisher incidents and any independent checks kept for sensitive changes.

We met a practical example: a fresh Mac could pass all local checks but fail to publish the required status because GitHub App credentials were missing from the Keychain. Merge safety held; developer experience suffered.

Moving a cost away from GitHub doesn't make it disappear.

## What we can responsibly conclude

We **did remove entire families of redundant hosted PR test jobs** from this pilot without removing those checks from the validation contract. One targeted Go command produced faster feedback in a warm local environment. Those are defensible statements.

We do not yet have a trustworthy **standardized** reduction in GitHub runner consumption, a median feedback improvement, net financial savings or an observed delivery-quality uplift.

We have therefore written a [reproducible measurement protocol, including formulas, refusal conditions and collection tools](https://github.com/EtienneDeneuve/etiennedeneuve.github.io/blob/master/docs/research/ci-locale-protocole-mesure-2026-10.md). Once comparable, complete windows are available, we can publish stronger numbers.

**Retesting everything by default does not prove we understand dependencies. Optimizing against an incomplete chart of runner-minutes does not prove we understand CI either.**

The tangible progress so far is that the validation decisions are more explicit — and we have a way to test whether they really are better.

## Reference documentation

- [GitHub: workflow-run searches and limits](https://docs.github.com/en/rest/actions/workflow-runs)
- [GitHub: jobs across all run attempts](https://docs.github.com/en/rest/actions/workflow-jobs)
- [GitHub: Actions usage and billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

*Anonymized field report from one pilot repository. Incomplete and non-standardized initial measurements are deliberately excluded from the conclusions.*
