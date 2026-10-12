---
title: "We moved CI onto our Macs. Not our standards."
description: "Nix, devenv, prek, and local PostgreSQL to bring checks closer to the code, without maintaining two contradictory technical chains."
pubDate: 2026-10-16T07:30:00.000Z
language: en
translationKey: 2026-10-16-deplacer-ci-sur-mac-devenv
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - Nix
  - devenv
  - CI/CD
  - macOS
  - Developer Experience
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre-en
  - 2026-10-23-github-garde-dernier-mot-ci-locale-en
  - 2026-10-30-tester-changement-sans-tout-relancer-en
  - 2026-11-06-retour-experience-ci-locale-ia-en
  - 2026-11-13-mesurer-impact-ci-locale-en
  - 2026-10-03-provisioning-mac-pas-probleme-mdm-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

> Series **When AI speeds up the code, CI has to keep up**, 2/6. The start: [why we began moving validations](/en/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre-en/).

Running tests on a Mac is not hard.

Making sure another developer, on a freshly installed Mac, gets the same result without spending a day fixing their environment is another story.

I wanted to avoid the classic "works on my machine," this time applied to CI.

## The workstation already knew how to do almost everything

In [the series on Apple Business, Entra, and Nix](/en/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm-en/), I talked about our choice not to put all provisioning on the MDM.

Apple Business handles enrollment and prerequisites. Entra provides an identity and rights. Nix composes the workstation.

On the internal project that served as our pilot, we already had devenv. It describes the toolchain, services, and commands needed in the repository. The working environment therefore does not depend on a small checklist everyone follows more or less carefully.

That is not new. The change was deciding that this environment could also carry a large share of the validations.

~~~text
Nix sur le Mac
  -> outils du poste

devenv dans le repository
  -> outils et services du projet

scripts de validation versionnés
  -> ce qu'on vérifie réellement
~~~

I prefer these responsibilities to stay separate. When a tool is missing, you know where to declare it. When a test is wrong, you do not need to change Mac provisioning.

## Why I did not add another hook system

We already had prek, integrated into our shared tooling.

I could have added Husky or Lefthook to the repository and written all the check logic there. It would probably have worked. But we would have had two ways to install hooks and several places to look when they stop running.

We kept prek and versioned Bash scripts, usable without Git.

~~~bash
devenv shell -- check:commit
devenv shell -- check:push
devenv shell -- ci:validate
~~~

There are deliberately three commands.

\`check:commit\` must stay almost instantaneous. It catches leftover conflict markers in files, formatting errors, and a few syntax problems. No PostgreSQL database, no full compilation.

\`check:push\` is a broader check you can run by hand. It stays distinct from full validation.

\`ci:validate\` is the PR-ready validation. That is what must produce the publishable result for the tested commit. The pre-push hook can call it on a \`git push\`, but you can also run it explicitly to diagnose a failure.

That avoids a fairly silly trap: treating a formatting pass as proof the change is ready to merge.

## A real local database

The most useful part to bring back onto workstations was PostgreSQL.

On our project, compiling Go was not enough. We needed to verify migrations, query compatibility, and integration tests against a database.

devenv knows how to start the service. Then the scripts wait until it is ready and prepare isolated test databases.

A few details that matter more than the diagram: start from an empty database before a replay, do not let a fixture pollute later tests, fail the validation when PostgreSQL is missing rather than silently skipping integration.

We also added upgrade checks against a populated database. A migration that works on a blank database is not necessarily able to run on a database that has been in use for two years.

That is the kind of issue I would rather discover before pushing than after deploying.

## We also had to think about agents

Choosing versioned scripts turned out to be fairly practical on that front.

An agent that can run commands, from an IDE or a terminal, can execute the same validations as a developer. It reads the result, fixes, and retries.

I did not create an "agent-ci" command with a shorter suite and three exceptions.

And the hooks remain useful even when the agent forgets the tests. They do not replace merge policy, but they make the usual path harder to skip.

On a repository where commits arrive often, that detail ends up mattering.

## The Mac does not become a GitHub runner

That is a distinction I wanted to keep very sharp.

Workstations are not registered as self-hosted runners. GitHub does not use them to arbitrarily run repository jobs. Validations are triggered locally, in the developer's context, with the project's tools.

So we did not create a CI farm to operate, nor a dependency on an extra controller.

That is also what interests us for what comes next. The setup runs today on one internal project; the Nix, devenv, and hooks foundation should be reusable on other repositories, each with its own suites. We have not done that generalization yet.

And I am not trying to claim a macOS result replaces every Linux test. If you need to validate a Linux-runtime-specific property, build an image, or sign an artifact in a controlled environment, that work still belongs elsewhere.

## The test that always fails on the first pass

A developer who has had every tool installed for months is a fairly poor reproducibility test.

I want to see what happens on a new Mac: does devenv enter correctly? Does the PostgreSQL service start? Are the hooks present? Do the errors explain how to repair the environment?

And, as we discovered later, you have to go a bit further: passing the tests is not enough if the workstation does not have the identity needed to publish the result to GitHub.

I come back to that part in the next article. It is less comfortable than \`devenv shell\`, but much more interesting for understanding where trust sits.

## Official sources

- [devenv: Git hooks](https://devenv.sh/git-hooks/)
- [Nix](https://nixos.org/learn/)
- [prek](https://prek.j178.dev/)
