---
title: "Test everything on every change? Not necessarily."
description: "In a monorepo, selecting the relevant suites is a real dependency problem, not just a filter on modified directories."
pubDate: 2026-10-30T07:30:00.000Z
language: en
translationKey: 2026-10-30-tester-changement-sans-tout-relancer
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - CI/CD
  - PostgreSQL
  - Go
  - Rust
  - Testing
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre-en
  - 2026-10-16-deplacer-ci-sur-mac-devenv-en
  - 2026-10-23-github-garde-dernier-mot-ci-locale-en
  - 2026-11-06-retour-experience-ci-locale-ia-en
  - 2026-11-13-mesurer-impact-ci-locale-en
  - 2026-10-03-provisioning-mac-pas-probleme-mdm-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

> Series **When AI speeds up the code, CI has to keep up**, 4/6. The start: [why we began moving validations](/en/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre-en/).

Once CI was local, we rediscovered a problem we already knew with runners: a small change is enough to relaunch far too much.

On the internal project where we started, the repository contains Go, Vue, PostgreSQL, and some Rust. Checking everything after every modification can get fairly painful.

But if you start dropping tests somewhat at random to save time, you have missed the original goal.

## A change in a folder does not necessarily concern that folder

The first idea is obvious: look at the modified files and pick the matching suite.

\`apps/backend/\` triggers the Go tests. \`apps/frontend/\` triggers the frontend tests. Rust code triggers Clippy and the native tests.

That works for the simple cases.

Then a change lands in a shared library. Or in a PostgreSQL migration used by two applications. Or in the script that itself decides which tests to run.

With filtering based only on directories, all of that can slip through.

So I preferred to reason from the consumers of the change. If a shared contract moves, you need to check the applications that depend on it, even if their code has not changed.

That looks something like this:

| Modification | What we check |
| --- | --- |
| Backend Go | Static analysis, unit tests, relevant integration |
| Vue / frontend | Frontend typecheck and tests |
| Shared library | Relevant consumers, even outside the modified folder |
| SQL / migrations | Lint, replay, compatibility, sqlc, integration |
| Rust | Format, Clippy, applicable tests |
| CI tooling | CI contract tests and a conservative trigger |
| Documentation only | Fast checks, no PostgreSQL database by default |

This table obviously does not replace the repository's real dependencies. It is a way to make the decisions readable.

## The detail I had underestimated: compare against what?

You have to identify the diff. And that is often where "affected" scripts become less simple than they look.

If the PR contains five commits and you only compare \`HEAD\` to \`HEAD~1\`, you only see the last one.

What I care about is the change proposed for integration. So we work relative to the base branch and the appropriate merge-base.

~~~bash
base="$(git merge-base origin/main HEAD)"
git diff --name-only "$base" HEAD
~~~

*Principle example. In a real script, you have to handle the target branch and the absence of a merge-base.*

You especially need to think about a shallow checkout, an outdated base branch, or missing local history. If I cannot compute the diff correctly, I prefer to fail or widen the tests rather than conclude that nothing changed.

That choice is a bit less comfortable when you only look at check duration. But a green status produced by an incomplete diff is not worth much.

## PostgreSQL forced us to go further

That is probably where we spent the most time clarifying what we actually wanted to test.

At first, we already checked syntax and some DDL rules. But a well-written migration is not necessarily a migration compatible with the running system.

We added several checks: replay history on a clean database, verify the schema actually obtained, check its consistency with sqlc queries, and prevent silent rewriting of migrations already integrated.

Then we had to look at upgrades on existing data.

A poorly prepared \`ADD COLUMN ... NOT NULL\` can break on a populated database while causing no problem in a test that recreates everything from scratch. Same for a backfill, a constraint validated too early, or an index created at the wrong time.

We started testing that situation with representative synthetic data.

~~~text
Base N-1 déjà peuplée
  -> nouvelles migrations
  -> vérification des contraintes et des données
  -> requêtes des versions compatibles
~~~

There is another trap with rolling deployments: during deployment, old and new code can serve queries at the same time. You cannot assume every application flips in the same second.

That is not specific to local CI. But since we were bringing these checks home, we might as well stop settling for a green \`migrate up\`.

## Not everything is validated at the same time

I also did not want to turn pre-push into a full E2E campaign.

Pre-commit stays short. PR-ready validation runs the checks relevant for integration. For E2E, we now have a distinct status, required by GitHub on PRs. It can be satisfied in two ways: the full journeys pass locally when the change touches the relevant application surfaces, or the check is explicitly marked "not required" for a diff that does not need it.

That second case is not a successfully executed E2E: it is a test-selection decision, also tied to the commit SHA. The first screenshot shows exactly that case: GitHub requires the E2E check, but diff analysis concluded that no full journey was needed.

<!-- IMAGE À INTÉGRER APRÈS IMPORT DES ASSETS ANONYMISÉS :
     Fichier préparé : ci-e2e-not-required-anonymized.webp
     Alt : « Contrôle E2E exact-SHA requis sur GitHub, marqué non nécessaire pour cette modification »
     Légende : « Requis ne veut pas dire exécuté à chaque PR. Si le diff ne nécessite pas d’E2E, le statut le dit explicitement. »
     Le nom interne du contexte est masqué ; ne pas ajouter la capture originale au dépôt public.
-->

Selection must stay conservative when you cannot correctly determine what changed. Release keeps its own validation criteria as well.

Production images and artifact builds also keep their own checks. A local test on macOS does not replace verifying the contents of a Linux image.

## You have to test the selection rules themselves

The part I find least visible may be the most important.

When you add a new folder or a cross-cutting dependency, who checks that the right test will be chosen?

You can write very simple tests with fictional file lists. A migration must trigger the DB checks. A shared library must touch its consumers. A documentation change should not start PostgreSQL.

And if you modify a CI script, it is better to rerun a broader validation than let the script declare itself impact-free.

During the migration, we also compared the local suites with the old GitHub Actions jobs. Seeing two green statuses was not enough: we had to check whether the same controls were actually executed.

I would rather have discovered that kind of gap in the script review than after removing the historical workflow.

## No need for a new controller for this

We could have added a runner farm, a shared cache system, and a task orchestrator.

There are contexts where that would be relevant. Here, we already had Nix, devenv, versioned scripts, and GitHub for the merge.

I mostly wanted to keep something a developer could understand by reading a few files in the repository.

Eventually, we want to apply the same logic to all our repositories. The principle is reusable; the dependency map and the checks themselves will need to be rebuilt for each one. That is one reason I prefer a readable contract over a huge opaque orchestrator.

Test selection then becomes a contract you can discuss and whose exceptions you can verify. And when it is not sure, it must be able to run more checks.

In the next episode, I come back to the details that complicated the rollout onto workstations, especially the GitHub publisher. The last article will be reserved for measurements, because a nicer validation in my terminal is not enough to prove we actually saved time.

## Official sources

- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [sqlc](https://docs.sqlc.dev/)
- [Playwright](https://playwright.dev/)
