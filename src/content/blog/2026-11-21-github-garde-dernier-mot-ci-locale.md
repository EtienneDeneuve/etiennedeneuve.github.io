---
title: "Les tests tournent en local. GitHub garde le dernier mot."
description: "Un contrôle local doit rester lié au commit exact et être soumis à la gouvernance GitHub. Ce que garantit réellement ce modèle, et ses limites."
pubDate: 2026-11-21T07:30:00.000Z
language: fr
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
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-28-tester-changement-sans-tout-relancer
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-12-12-mesurer-impact-ci-locale
  - 2026-10-10-apple-business-entra-identite-workstation
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l'IA accélère le code, la CI doit suivre**, 3/6. Le début : [l'IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Déplacer les tests en local n'était pas le choix qui me gênait le plus.

Ce qui m'intéressait, c'était la suite : **comment faire en sorte que GitHub refuse un changement qui n'a pas passé les contrôles attendus, alors que ces contrôles ne tournent plus systématiquement sur un runner GitHub ?**

Je ne voulais pas d'un simple message dans la PR disant « testé chez moi ». Et je ne voulais pas non plus que le fait d'utiliser un agent IA change les règles.

## Le SHA doit être une donnée de premier ordre

Imaginons un commit A. Je lance les tests et ils passent.

L'agent corrige ensuite deux fichiers, crée un commit B, puis pousse la branche.

Si je réutilise naïvement le résultat de A pour B, ma chaîne de validation n'a plus beaucoup de valeur.

Nous avons donc attaché la preuve locale au SHA exact de la révision testée. Ce résultat contient un état, les contrôles exécutés et le type de validation. Un test léger et une validation PR-ready sont deux choses différentes.

~~~json
{
  "sha": "sha-complet-du-commit",
  "gate": "pr-ready",
  "status": "success",
  "checks": [
    "backend-unit",
    "frontend-typecheck",
    "db-integration"
  ]
}
~~~

*Exemple simplifié de structure, pas un schéma contractuel ni un résultat de production.*

Si le SHA change, le résultat précédent ne doit plus autoriser le merge. Un rebase, un amend ou un nouveau commit imposent une nouvelle preuve.

Cela ne garantit pas que les tests ont vraiment été exécutés. Mais cela évite déjà de mélanger un succès ancien avec une révision nouvelle.

## GitHub reste le point de décision

Le flux que nous avons retenu sépare le calcul et la publication.

~~~mermaid
sequenceDiagram
    participant D as Poste / agent
    participant G as Git
    participant A as GitHub App
    participant H as GitHub
    D->>D: Validation PR-ready
    D->>D: Écriture de la preuve exact-SHA
    D->>G: Push du commit
    G->>H: Envoi de la révision
    D->>A: Demande de publication du statut
    A->>H: Status lié au SHA
    H->>H: Evaluation du ruleset
~~~

L'idée est que le code peut être validé sur le poste, mais que le merge reste soumis à une politique centralisée : revues, règles de branche et statut requis.

L'agent, quel qu'il soit, n'est pas l'autorité de merge.

## Pourquoi ne pas publier avec les credentials habituels ?

J'ai préféré utiliser une GitHub App dédiée plutôt que les credentials Git personnels d'un développeur.

Elle permet de distinguer l'identité qui publie les résultats de celle qui pousse le code. Le ruleset peut exiger un contexte de statut, par exemple \`engineering/local-ci\`, et restreindre la source à l'application autorisée.

Le nom du contexte ici est illustratif. L'intérêt est le contrat, pas la chaîne de caractères.

Mais cette séparation a une conséquence : il faut provisionner l'identité du publisher sur les machines autorisées.

Dans notre cas, l'App lit les credentials dans le Keychain macOS, avec une clé privée distribuée depuis Azure Key Vault. Ce chemin doit être documenté, testable sur un Mac neuf et correctement géré lors des rotations.

On retrouve ici un sujet que j'abordais dans [l'article sur Entra et l'identité de la workstation](/thinking/2026-10-10-apple-business-entra-identite-workstation/) : une machine peut être techniquement prête, mais ne pas avoir les autorisations nécessaires pour participer au workflow attendu.

Ce sont deux états différents, et les messages d'erreur doivent le dire clairement.

## Le détail qui casse facilement : quand publier ?

Un commit local n'existe pas forcément encore côté GitHub.

Dans le parcours habituel, il faut donc valider, pousser, puis publier le statut une fois le commit accessible à l'API.

Dit comme ça, ça paraît trivial. Mais un hook pre-push tourne **avant** que Git ait terminé l'envoi. Il ne peut pas simplement supposer que la révision est déjà visible à distance.

Nous avons séparé les deux étapes et travaillé sur une synchronisation après le push.

C'est aussi là que commencent les scénarios moins agréables : un push rejeté, une coupure WAN, deux pushes successifs, une publication qui arrive en retard.

Attendre que le processus Git ait disparu n'atteste pas de la réussite du push. Il faut également vérifier que le SHA ciblé existe sur le remote prévu et que les erreurs de publication restent visibles et récupérables.

Je ne considère pas un simple script « qui marche une fois » comme une validation de ces cas.

## Ce que la GitHub App ne prouve pas

C'est le compromis qu'il faut expliquer, surtout lorsqu'on présente cette architecture à une équipe sécurité.

Une GitHub App peut garantir quelle identité a publié un statut. Le SHA garantit sur quelle révision porte ce statut.

**Cela ne prouve pas que le poste a exécuté honnêtement les tests.**

Si un développeur contrôle intégralement son Mac et détient de quoi signer une publication, il peut potentiellement fabriquer un résultat de succès. Un poste compromis peut représenter le même risque.

Azure Key Vault contrôle la distribution de la clé. Il ne transforme pas un laptop en environnement d'exécution attesté.

Dans une organisation qui exige une séparation indépendante entre auteur du changement et validateur, je conserverais donc un contrôle distant sur les propriétés concernées. Il peut s'agir de tests sensibles, d'un build signé ou de mécanismes d'attestation adaptés au modèle de menace.

La distinction est importante : **la reproductibilité de l'environnement et la confiance dans l'exécution sont deux questions différentes**.

## Et le bypass ?

On peut avoir le meilleur required check du monde et laisser des comptes privilégiés contourner le ruleset.

La gouvernance ne se résume pas à écrire \`required: true\` dans une interface. Il faut examiner les exemptions, les droits de publication, les permissions du GitHub App et le comportement en cas de statut manquant.

Sur un poste non provisionné ou en cas de panne réseau, l'échec acceptable est que le merge reste bloqué, pas que le système suppose que les tests sont passés.

## Ce que nous cherchions à obtenir

Je voulais que la validation quotidienne soit proche du développeur, y compris lorsqu'un agent produit les changements.

Je voulais également que GitHub reste responsable de dire « cette révision satisfait les conditions d'intégration ».

Et je voulais que les limites soient explicites : c'est un modèle adapté à des équipes de confiance, pas un substitut universel à une CI distante indépendante.

## Suite

4/6 : **Tout tester à chaque changement ? Pas nécessairement.** Nous allons regarder comment sélectionner les contrôles utiles sans laisser un changement transversal passer entre les mailles du filet.

## Sources

- [GitHub : commit statuses](https://docs.github.com/en/rest/commits/statuses)
- [GitHub : règles de protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub : authentification des GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
