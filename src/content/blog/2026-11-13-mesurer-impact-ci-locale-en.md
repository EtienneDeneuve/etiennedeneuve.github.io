---
title: "Local CI: fewer GitHub minutes, but what real gain?"
description: "A first quantified comparison of our local CI: runner minutes, dollars, feedback latency, and quality indicators, without inventing an ROI."
pubDate: 2026-11-13T07:30:00.000Z
language: en
translationKey: 2026-11-13-mesurer-impact-ci-locale
contentType: architecture-decision
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
draft: false
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

There is something people do easily after changing a CI: take the job that was slow, show that the command now runs faster on their Mac, then announce a percentage improvement.

I nearly did exactly that.

Except looking a bit closer at the numbers, we were sometimes comparing the full duration of a remote job with the duration of a single local command. And the financial gain told a completely different story from the feedback gain.

To finish this series, I prefer to look at what we actually measured, and what we are still missing.

## We had a starting snapshot

Before removing the historical workflows, we collected activity from one of our internal projects, the one where we deployed this approach first.

The audit window ran from 7 to 25 September 2026. It contained **561 workflow runs, 635 jobs, and 2,964 minutes of cumulative job duration**.

That is a useful first order of magnitude. You see the recurring jobs, duplicate triggers, cancelled runs, tool setup, and the validations actually executed.

But 2,964 job minutes do not mean 2,964 billed minutes. The period is not a full month, runners can have different rates, and GitHub applies its own billing rules.

It would have been fairly easy to multiply that number by a rate and announce a saving. That would mainly have produced an incorrect figure.

## The interesting benchmark was much smaller

We isolated a representative Go test command and compared several runs.

| Run | Measurement |
| --- | ---: |
| Full historical GitHub Actions job | 6 min 10 s average, p95 at 9 min 48 s |
| Simplified GitHub runner, cold cache | 4 min 32 s |
| Simplified GitHub runner, warm cache | 1 min 36 s |
| Local command, cold cache | 121.25 s |
| Local command, warm cache | 38.63 s |

These values come from our audit and the targeted trials on 2 October 2026.

You have to be careful about what you read. The historical average covers the whole job, with its setup and other checks. The simplified trials targeted the same business command, but the environment, startup, and caches were not identical.

**What I take away is that the chosen command produced a warm local result in under forty seconds.** That is not the full validation time for a PR, nor proof that every change validates at that speed.

On the workstation, those few seconds still change how you iterate. You fix while the context is still fresh, rather than coming back to a problem after a remote cycle.

But I want a measurement of that behavior over several weeks before drawing a general conclusion.

## And in dollars, what does that give?

This is where the topic gets amusing.

As of 8 October 2026, GitHub's public rates list **USD 0.006 per minute for a standard two-core Linux x64 runner** and **USD 0.062 for a standard macOS runner**. GitHub rounds each job's duration up to the next minute. You then have to account for minutes included in the plan, other usage, and storage.

An order of magnitude: one hundred PRs that each saved ten minutes on a standard Linux runner represent **USD 6 of gross consumption** before quotas.

That is not a saving we observed. It is simply the rate applied to an easy-to-check hypothesis.

And put that way, you immediately see that standard Linux runners are not necessarily the best economic argument to justify weeks of work.

With more expensive runners, more jobs, or workflows that continually rebuild the same things, the bill can become more significant. It is the real execution profile that decides, not the demo on one PR.

A serious calculation must start from *billable* consumption by runner type and from the GitHub bill before and after, without mixing PR tests with the builds, previews, and releases that keep running.

## Developer time is harder to measure

A saved CI minute is not automatically a recovered minute of human work.

While a job runs, a developer can review something else. An agent can keep working. Conversely, a failure that arrives too late can completely break a work session.

What I would like to measure is the time between a change and **the first usable result**, then the share of that delay during which someone was actually waiting.

I would look at the median and the p90, not the best run with a warm cache.

I would also like to compare how many fixes go out in a PR with an error that was detectable locally. That is a more interesting indicator than a simple count of tests executed.

If errors are fixed before the push and PRs arrive more often already in a valid state, we will have gained something in the work flow.

But that gain does not automatically express itself as euros of salary saved. At best, you can talk about recovered capacity, provided you measure it seriously.

## The indicators I would keep

I would limit myself to a few figures the team can actually use.

| Topic | Measure to track |
| --- | --- |
| Feedback | Median and p90 of the delay between a change and the first usable result |
| Integration | Delay between PR opening and a truly mergeable state |
| GitHub Actions | Billed minutes and cost by runner type, separated across PR, preview, and release |
| Quality | Required checks executed per surface and failures escaping local validation |
| Publisher | Statuses published on the correct SHA, errors, and publication delays |
| Onboarding | Time needed on a new Mac to produce a mergeable PR |
| Friction | Retries, post-push fixes, and observed blocking waits |

You also have to distinguish change types. A documentation PR, a PostgreSQL migration, and a Rust change should not have the same validation profile.

I would not aggregate all of that into a single "developer productivity" score. You would lose precisely the problems you are trying to understand.

## The before / after comparison is not finished yet

We have a baseline and a few precise benchmarks.

We still lack a stabilized post-cutover window, with the same scope and the same indicator definitions. I would take four comparable weeks before and after, separating builds and tests, then check that PR volume and nature have not changed too much.

You would also need to track time spent maintaining local environments. A Mac that compiles locally consumes resources. Caches take space, PostgreSQL can interfere with another service, and onboarding needs support.

The GitHub bill does not tell that part of the story.

Finally, I would keep an eye on status publication failures. A fast validation that regularly blocks merges because the GitHub App does not publish correctly has not improved the experience.

## What I take away for now

On this first project, we showed that part of the checks could move back onto the workstation with shorter feedback on the measured scenarios.

We also reduced dependence on remote workflows for repetitive verifications, while keeping GitHub as the decision point before merge.

Results still need consolidating over a full cycle, and the publisher edge cases still need finishing. And above all, we have not yet deployed the model on all our repositories: that is the next phase of the work, not a result we can already quantify.

So I am not going to announce a global ROI or a definitive monthly saving.

The most interesting part, for me, is elsewhere: we started wanting to accelerate a validation loop and ended up connecting workstation provisioning, the project environment, the tested commit, and its integration decision.

That is fairly close to what I was already looking for when [versioning our workstations like software](/en/thinking/2026-10-28-versionner-postes-semver-nix-en/).

And if the next measurement shows that some validations need to go back onto a remote runner, that will not be a failure. At least we will know why we run them there.

## Official sources

- [GitHub: Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing)
- [GitHub: GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
