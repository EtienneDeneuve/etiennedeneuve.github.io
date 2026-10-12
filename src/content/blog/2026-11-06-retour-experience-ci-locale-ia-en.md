---
title: "Develop at AI speed, ship with engineering rigor."
description: "A field report on moving validations local: onboarding, GitHub statuses, trust, cutover, and mistakes I would try to avoid."
pubDate: 2026-11-06T07:30:00.000Z
language: en
translationKey: 2026-11-06-retour-experience-ci-locale-ia
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - AI Engineering
  - CI/CD
  - GitHub
  - Nix
  - Platform Engineering
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre-en
  - 2026-10-16-deplacer-ci-sur-mac-devenv-en
  - 2026-10-23-github-garde-dernier-mot-ci-locale-en
  - 2026-10-30-tester-changement-sans-tout-relancer-en
  - 2026-11-13-mesurer-impact-ci-locale-en
  - 2026-10-03-provisioning-mac-pas-probleme-mdm-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

On the internal project that served as our first proving ground, the design looked fairly clean.

A Mac prepared with Nix, devenv for the project environment, a few validation scripts, a result attached to the SHA, and GitHub still deciding the merge.

Then we started having it used somewhere other than the machine that had designed it.

That is when the details got interesting.

## Everything worked, except the GitHub status

On one of the new Macs, devenv started, the tools were present, and local validation passed.

But the required check did not appear on the PR.

The problem was neither PostgreSQL, nor Go, nor a badly installed hook. The publisher could not find the GitHub App credentials in the Keychain.

That is fairly typical of this kind of project: you think you have sorted the development environment, then you discover a missing piece of the full path.

We documented onboarding for the publishing identity. But a new workstation that still needs a manual procedure before it can merge its first PR is not done.

Eventually, I want that path to be reusable and diagnosable cleanly, including during a key rotation.

That is why I connect this series to [macOS provisioning with Apple Business and Entra](/en/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm-en/).

The machine could run the expected tools. It was not yet ready to publish the result and make a PR mergeable.

At the time, that is rather annoying. In hindsight, it shows clearly that "workstation ready" is a stricter definition than "installation finished."

## The pre-push hook cannot know the future

Another point that seems obvious once you have hit it: the hook fires before the push finishes.

We needed to publish the result once the commit was actually present on GitHub. Local validation itself could have taken several tens of seconds or a few minutes. I did not want to replay it because an API call had failed.

So we separated the two operations: local computation on one side, status publication on the other.

That solves part of the problem. But not every unpleasant case.

What happens if the remote refuses the push? If the network disappears during publication? If an amend changed the SHA between two attempts? If two pushes arrive quickly?

A process that stopped is not necessarily a successful push. And a status published after the fact must still target the right revision.

These scenarios remain points I want to see tested end to end before considering this part fully industrialized.

I prefer a publication that fails clearly and blocks the merge over one that declares a doubtful success.

## The transition has a cost too

For a while, we had both local validations and the old GitHub Actions workflows.

That was deliberate: before removing a job, I want to verify that its local equivalent actually covers the same properties.

The trap is that two green jobs do not prove they did the same work.

We found gaps between the historical remote checks and some early versions of the local scripts. We had to reconcile the commands, the tests, and the cases where they trigger.

That is much easier to fix while the old job still exists.

On the other hand, this "in parallel" phase must not become a permanent state. Otherwise you pay for remote executions while running the same validations on the Macs.

So we gradually removed the redundant jobs, while keeping those whose remote execution still provides a real guarantee. The E2E check is now a required status on PRs, executed locally when the change needs it.

I also keep a reservation about closing the project: the last cutover gaps, the publisher scenarios, and measuring the overall result need to be validated before we put "done" everywhere.

## The problem is not trusting a JSON file

We talked in [the previous episode on GitHub](/en/thinking/2026-10-23-github-garde-dernier-mot-ci-locale-en/) about the trust limit of a status produced from the workstation.

I will not rehash the whole topic here. The point I keep is that you have to document that limit in the architecture and not let the word "required" create a false sense of attestation.

For internal contributions within a defined trust perimeter, the model can be a useful compromise. For untrusted contributions or strong separation requirements, you will need to keep an independent check.

Using a GitHub App does not change that reality.

## What I would do earlier next time

I would add a new Mac to the first tests, not the last ones.

I would then check a few simple scenarios: failing check, missing PostgreSQL database, modified SHA, rejected push, impossible publication, and credential rotation.

I would also start with a precise map of the tests already run in the remote workflows. Not only their names: the real commands and the properties verified.

And I would take a snapshot of costs and feedback times before any change.

That is less visible than a new pipeline. But without it, it quickly becomes hard to know whether the migration actually improved anything.

## From workstation to code, then to delivery

I had started by [versioning workstations like software](/en/thinking/2026-10-28-versionner-postes-semver-nix-en/) to know what actually runs on each Mac.

You find a bit of the same problem here: we want to know which commit was verified, by which checks, before which integration, then which artifact is delivered.

The acceleration from AI agents makes these questions more frequent. It has not changed their nature.

We now want to extend this setup to all of our repositories, but work remains: some repos do not have the same suites, the same languages, or the same publishing requirements. I am not going to claim we have already deployed homogeneous local CI everywhere.

I also still have an important question: does the new way of working bring a measurable benefit beyond comfort in the terminal?

I saved that for the last article. With the numbers we have, the ones we are missing, and the comparisons I refuse to make.

## Official sources

- [devenv](https://devenv.sh/)
- [GitHub: rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
