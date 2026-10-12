---
title: "Tests run locally. GitHub has the final say."
description: "A local check must stay tied to the exact commit and remain under GitHub governance. What this model actually guarantees, and its limits."
pubDate: 2026-10-23T07:30:00.000Z
language: en
translationKey: 2026-10-23-github-garde-dernier-mot-ci-locale
contentType: architecture-decision
pillar: software-supply-chain
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - GitHub
  - GitHub App
  - CI/CD
  - Software Supply Chain
  - Platform Engineering
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-09-ia-accelere-code-ci-doit-suivre-en
  - 2026-10-16-deplacer-ci-sur-mac-devenv-en
  - 2026-10-30-tester-changement-sans-tout-relancer-en
  - 2026-11-06-retour-experience-ci-locale-ia-en
  - 2026-11-13-mesurer-impact-ci-locale-en
  - 2026-10-14-apple-business-entra-identite-workstation-en
  - 2026-10-28-versionner-postes-semver-nix-en
---

Once the tests were back on the Macs, one slightly awkward question remained.

On GitHub, what stops someone from merging a PR when they have not validated anything?

I did not want to replace a workflow that ran tests with a message in the PR description saying "it passes on my machine." Even if the message comes from a very confident agent.

The idea was to keep the GitHub rules, without asking it to systematically recompute everything the workstation just verified.

## First, stop talking about a result without talking about the commit

I started with the SHA.

Suppose the tests pass on commit A. The agent fixes a detail, makes a new commit B, and pushes. If A's validation still counts for B, there is a hole in the model.

So the validation command writes a local result that records the tested commit, the checks performed, and the validation level. A pre-commit that checks three files does not produce the same evidence as a PR-ready validation with PostgreSQL and integration tests.

The evidence produced by local validation must carry the tested revision and the verification level reached. A quick formatting pass and a full validation with PostgreSQL are not interchangeable. That contract is checked before publishing a merge status.

After an amend or a rebase, the SHA changes. The previous result no longer applies. Validation must be replayed on the new revision.

## GitHub does not need to run the test to block the merge

We used a GitHub App to publish a commit status and a ruleset that requires that context.

On a PR from our internal pilot project, you see both local checks marked `Required`, with a green status on the exact commit. GitHub then shows the merge button. That is the behavior we want to see, eventually, across all of our repositories. You do not need to show the publisher script to explain what is happening.

<!-- IMAGE TO ADD AFTER IMPORTING ANONYMIZED ASSETS:
     Prepared file: ci-required-checks-anonymized.webp
     Alt: "GitHub: local validation and exact-SHA E2E required, PR ready to merge"
     Caption: "Two checks produced locally, two required checks on GitHub."
     Internal names are masked; do not add the original screenshot to the public repo.
-->

The screenshot shows that the merge policy exists and works on this PR. It does not, by itself, prove that local execution actually happened.

I preferred a dedicated App rather than publishing results with personal Git credentials. That lets you limit which status source the ruleset allows.

That obviously also means checking the bypasses. A rule you can circumvent with the right privileges remains a circumventable rule. Better to know exactly by whom.

## Pre-push comes too early

That is the detail that kept us busier than expected.

When the pre-push hook starts, Git has not yet sent the commit. If the publisher queries the GitHub API at that moment, the revision may not exist on the remote yet.

So the flow becomes: validate, push, then publish the status once the commit is available.

Except a push can be rejected. It can end during a network outage. Two pushes can also follow each other quickly.

We separated computation from publication so we would not have to rerun the whole suite on a network failure. The publisher then has to verify the revision that is actually available on the remote repository, not only that the Git process stopped.

That is a part I do not want to call done just because three pushes went well. Failure and concurrency cases are precisely the ones you need to replay.

The right behavior when in doubt is fairly simple: no success status, therefore no merge through the normal path.

## A new machine can test, but not publish

On a Mac I have used for months, the needed credentials are already there.

On a freshly installed workstation, it is another story. We hit the case of a correct local validation, followed by an impossible publication because the GitHub App pieces were missing from the Keychain.

On our workstations, that publication relies on a dedicated identity whose access must be provisioned and maintained. A new Mac that can compile does not necessarily yet have the rights to publish the status. Access rotation is therefore part of the problem too.

That is exactly the link with [the identity / workstation separation in my Entra series](/en/thinking/2026-10-14-apple-business-entra-identite-workstation-en/). Having a ready environment does not mean the workstation automatically has every right it needs.

The error message must make it possible to tell a failing test from a status that cannot be published.

## And there is a limit you have to own

The fact that the status comes from a GitHub App does not prove the Mac actually ran the tests.

The App identifies who publishes. The SHA indicates the targeted commit. With a publishing key distributed on workstations, someone who fully controls one of those machines can potentially fabricate a result.

Managing access to that identity does not turn the Mac into an attested runner.

For a team whose threat model requires resisting a malicious contributor, I would keep an independent validation on the changes concerned. Same for a build whose provenance must be attested.

So this choice has its limits. It suits me better than an architecture that would promise "zero trust" while handing every laptop a publishing key without saying so.

On this first project, we made this separation between local validation and the GitHub decision work. It still needs to be adapted to other repositories, with their own security requirements and checks. Rolling it out across our repositories is still ahead of us.

There was still the problem of avoiding a full suite run on every change. That is the subject of the fourth article.

## Official sources

- [GitHub: commit statuses](https://docs.github.com/en/rest/commits/statuses)
- [GitHub: rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub: GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
