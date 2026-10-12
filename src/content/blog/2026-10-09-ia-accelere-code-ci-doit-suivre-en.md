---
title: "AI writes faster. Our CI had to keep up."
description: "AI-assisted development acceleration led us to move validations onto workstations, without abandoning GitHub governance."
pubDate: 2026-10-09T07:30:00.000Z
language: en
translationKey: 2026-10-09-ia-accelere-code-ci-doit-suivre
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - AI Engineering
  - CI/CD
  - Platform Engineering
  - Developer Experience
  - GitHub
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-16-deplacer-ci-sur-mac-devenv-en
  - 2026-10-23-github-garde-dernier-mot-ci-locale-en
  - 2026-10-30-tester-changement-sans-tout-relancer-en
  - 2026-11-06-retour-experience-ci-locale-ia-en
  - 2026-11-13-mesurer-impact-ci-locale-en
  - 2026-10-03-provisioning-mac-pas-probleme-mdm-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

> Series **When AI speeds up the code, CI has to keep up**, 1/6. The first article in a field report on how we validate code since agents changed the pace of development.

There is something fairly curious about AI agents.

You can have them modify a Go handler, the matching Vue interface, and a few tests in a matter of minutes. And then you wait while a runner reinstalls the tools before discovering a TypeScript error you could have caught on the Mac.

At first, that did not bother me particularly. That is how our CI worked; it did its job. But as we used more agents, the gap between the time needed to produce a change and the time needed to get feedback became hard to ignore.

I will not pretend an agent does three engineers' work in ten minutes. It produces changes quickly, and that alone is different enough to force us to revisit some habits.

## We had mostly put too much after the push

We put this model in place on one of our internal projects. The repository mixes Go, Vue, PostgreSQL, some Rust, and several applications: enough different cases that we could not settle for a POC on three files.

For now, this setup is deployed on that project. We do intend to roll it out gradually across all of our repositories, but that is not done yet. We will need to revisit each repository's checks, not simply copy hooks from one repo to another.

The GitHub Actions workflows checked the right things: unit tests, integration, typecheck, migrations, Rust checks. But each suite also carried some of the environment setup, with its tool downloads and caches.

When we started looking at GitHub Actions consumption, we found redundant checks and repeated setup. That was a useful starting point for the audit.

Except the first pain point was not even the bill.

Take a type error in a frontend change. It needs to be caught, of course. But do we really need to push a branch and spin up a remote environment to find it?

Same question for a Go test, a migration that will not replay, or Rust formatting.

At that point, I wanted to shorten the fix loop more than I wanted to delete jobs for the sake of it.

## The agent does not need a special CI

I am a bit wary of quality rules we add into prompts.

You can ask an agent to run all the tests, review its changes, and never declare a task done too early. Fine. But that is not a sufficient contract.

An agent can forget a command. So can a developer.

So we kept validation outside the conversation with the tool. It lives in the repository, as versioned scripts. It does not matter whether the change comes from a terminal agent, an IDE, or someone writing code the usual way.

The agent can run the same commands we do. And if it does not run them, the hooks and integration rules must still do their job.

That avoids a situation I really did not want to create: a fast path for AI, with a few randomly selected tests, and a serious path for everyone else.

## The work on Macs had already given us part of the answer

In [the series on Apple Business, Entra, and Nix](/en/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm-en/), I explained why I had separated enrollment, identity, and workstation configuration.

The goal was to have Macs whose tools and state we know, without asking everyone to rebuild their environment by hand.

Workstation versioning is also on the Mac series agenda. I will come back to it in a later episode, because what is actually installed on the machine becomes interesting once you entrust it with part of the validation.

Those are two topics I had not started for CI. But when we wanted to bring checks closer to the developer, the environment was already there.

Nix let us recover the expected dependencies. devenv added the project's services and commands. We did not need to invent a local runner: we mainly needed to use what already existed correctly.

## What we moved

The split we settled on is fairly simple.

~~~mermaid
flowchart LR
    A[Code humain ou agent] --> B[Checks locaux]
    B --> C[Preuve liée au SHA]
    C --> D[GitHub]
    D --> E[Merge selon les règles]
~~~

Pre-commit stays fast. PR-ready validation can start the needed services and run the relevant suites. Its result is tied to the exact commit.

GitHub keeps the merge rules. Release builds, image manufacturing, and checks that need an independent environment stay separate.

I was not trying to take GitHub out of the chain. I wanted to stop asking it to systematically redo work that was already reproducible on the workstation.

## There is still a fairly important limit

A test result produced on a Mac does not carry the same guarantees as a result produced on an independent runner.

The SHA tells you which commit is supposed to have been tested. A GitHub App lets you control who publishes the status. Neither proves that someone who fully controls their machine honestly ran the tests.

That trust boundary is part of the architecture choice. If the organization must resist a malicious contributor or a compromised workstation, it needs adapted independent checks.

In our case, we first wanted reproducible checks, run regularly, with GitHub still refusing changes that lack the expected status.

The hard part was not installing the tools in the end. It was finding the right split between the workstation, the repository, and GitHub.

That is what I cover in the second article, with devenv, hooks, and local PostgreSQL.

## Official sources

- [devenv](https://devenv.sh/)
- [GitHub: rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
