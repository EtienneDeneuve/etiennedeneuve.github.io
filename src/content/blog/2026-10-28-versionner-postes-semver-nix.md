---
title: "Je versionne mes postes de travail comme du logiciel"
description: "Un poste ne devrait pas être simplement « sur la dernière config Git ». Je traite maintenant la workstation comme un artefact versionné : registry privé, SemVer, provenance, closures Nix et rollback."
pubDate: 2026-10-28T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: software-supply-chain
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - Nix
  - SemVer
  - macOS
  - Azure Blob
  - Software Supply Chain
featured: true
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-14-apple-business-entra-identite-workstation
  - 2026-10-21-pourquoi-app-macos-swiftui-provisioning
  - 2026-11-04-ce-qui-casse-provisioning-macos
---

> Série **Nix, Entra et Apple Business : le découpage qui m’a enfin semblé propre**, 4/5. Le début : [pourquoi j’ai arrêté de traiter le provisioning Mac comme un problème MDM](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/). La suite arrive la semaine prochaine.

Il y a un truc que je trouve bizarre dans la gestion des postes.

Pour un service, une image ou une application en production, on veut savoir exactement quelle version tourne. On veut pouvoir retrouver le commit, reproduire le build et revenir en arrière si nécessaire.

Pour un laptop, on accepte encore très facilement « il a fait un git pull hier normalement ».

Je n’aime pas trop cette différence.

Si le poste est une plateforme de travail importante, je veux savoir ce que j’ai déployé dessus.

## J’ai commencé par le Bootstrap.pkg

Le premier truc facile à versionner était le package lui-même.

Aujourd’hui, le build produit un artefact nommé avec sa version et le commit source, puis embarque un petit fichier de provenance. Quand je diagnostique un Mac, je peux donc retrouver la version du package, celle de l’app, la révision de `mdm-setup` embarquée et la date du build.


Ce n’est pas très sophistiqué, mais ça répond déjà à une question qui devient vite pénible sans ça : **qu’est-ce que cette machine a réellement reçu ?**

## La version déclarée ne suffit pas, je veux l’état réellement observé

Mettre `2.7.0` dans un manifest ne sert pas à grand-chose si le Mac est incapable de me dire ce qu’il exécute vraiment.

J’ai donc commencé par rendre l’état observé concret avant même d’avoir terminé toute la mécanique SemVer distante.

Le dashboard de fin collecte maintenant la version du Bootstrap.pkg et de l’app, le commit embarqué, macOS, le système Nix actif, la taille logique de la closure en nombre de store paths, les binaires exposés dans le PATH, Homebrew, l’état live du MDM et la santé Entra/GitHub/helper.

Ça donne quelque chose de beaucoup plus utile qu’un simple « provisioning succeeded ».

![Dashboard final Omnivya Workstation avec versions, profil, Nix, Homebrew et état des services](/assets/2026/10/workstation/workstation-done-dashboard.webp)

*L’état observé est visible localement : identité, mode de management, versions du bootstrap, macOS, système Nix, Homebrew et commit source.*

Je garde quand même la distinction entre ce qui est **observé** et ce qui est **déclaré**.

Depuis les premiers essais, la partie déclarée a commencé à exister pour de vrai : Setup résout maintenant un channel, une version, un manifest et un `profile.json` depuis le registry privé. Ces informations sont attachées au run de provisioning et mises en cache localement.

Il me reste encore à aller jusqu’au bout du modèle `current / previous-known-good` et du drift automatique, mais je ne suis plus seulement en train de dessiner le format sur un tableau blanc.

Je pense aussi exposer exactement le même modèle en CLI :

~~~text
omnivya-nix status
omnivya-nix doctor
omnivya-nix inventory
~~~

avec une sortie JSON utilisable par l’app. Je n’ai pas envie d’avoir une logique de diagnostic différente entre le bouton SwiftUI et le terminal.

Pour les logiciels installés, je ne veux toujours pas afficher une liste de 800 store paths dans l’écran principal.

L’implémentation actuelle fait volontairement plus simple : nombre de paths dans la closure, nombre de binaires exposés, quelques exemples, nombre de formulae et casks Homebrew. Le snapshot complet est exportable en JSON pour le support.

La suite sera de croiser ça avec l’inventaire de release généré au build pour répondre à une question plus intéressante : non seulement « qu’est-ce que je vois sur cette machine ? », mais aussi « est-ce bien ce que cette release était censée contenir ? ».

C’est ce qui transformera progressivement le snapshot actuel en contrôle de conformité plutôt qu’en simple inventaire.


## Tant qu’à connaître cet état, autant le remonter

À partir du moment où le poste sait dire précisément ce qu’il est, garder cette information uniquement en local devenait un peu dommage.

J’ai donc branché un premier pipeline OpenTelemetry pour le pilote.

Et je n’ai toujours pas installé Alloy sur tous les Macs.

L’agent que j’avais déjà écrit émet directement de l’OTLP/HTTP. Sur mon Mac, un collector central reçoit les signaux et les route vers Prometheus, Loki et Tempo, puis Grafana affiche l’état du parc.

~~~text
Omnivya Workstation Agent
        |
        | OTLP/HTTP
        v
OTel Collector
        |
        +--> Prometheus
        +--> Loki
        +--> Tempo
        |
        v
Grafana
~~~

Pour le moment, c’est volontairement un lab : le collector tourne sur mon Mac et les machines pilotes le rejoignent sur le LAN ou Tailscale. Je garde l’auth Entra devant le collector pour l’étape suivante, quand je sortirai de ce setup local.

Le point intéressant est surtout que l’instrumentation existe déjà côté endpoint. Changer le backend plus tard ne doit pas demander de réécrire l’app.

L’agent remonte aujourd’hui un heartbeat, la santé du helper et de XPC, l’état Entra et GitHub, le mode d’enrollment et quelques informations d’inventaire. Le Setup interactif envoie de son côté ses traces end-to-end, ses logs structurés et la progression du téléchargement des artefacts registry.

J’ai aussi fait une passe pour éviter les métriques à forte cardinalité. Les états dynamiques restent dans des wide-event logs JSON ; les métriques Prometheus gardent des labels stables, principalement le host et les quelques dimensions réellement utiles.

![Dashboard Grafana Omnivya Workstation Agent avec santé de l’agent, helper, XPC, Entra et GitHub](/assets/2026/10/workstation/grafana-workstation-agent.webp)

*Le premier dashboard Grafana du pilote : santé de l’agent, helper/XPC, sessions Entra/GitHub, mode d’enrollment et logs de tick.*

Le dashboard n’est évidemment pas encore une console de fleet management complète, mais il répond déjà à des questions simples : est-ce que l’agent tourne, est-ce que le helper répond, est-ce que les credentials sont encore valides, est-ce que le Mac est en adoption locale ou enrôlé, et quand l’agent a parlé pour la dernière fois.

Le plus drôle est que j’étais parti d’une petite app de provisioning « pour le fun », et que je commence doucement à avoir un control plane de workstation sans l’avoir vraiment cherché.


## Le Bootstrap est déjà une vraie release

Au moment où j’écris ça, le Bootstrap lui-même est déjà arrivé à `0.1.45`, pendant que le registry workstation a commencé son propre cycle en `0.1.0`.

Chaque version est publiée sur un chemin Blob immuable, avec son SHA-256, son package signé et sa provenance. Je ne remplace jamais silencieusement un fichier derrière la même URL.

Ça m’a forcé assez tôt à appliquer au poste les mêmes réflexes qu’à un artefact logiciel : une version donnée doit pointer vers un contenu donné.

La configuration Nix doit maintenant suivre la même logique, mais avec son propre cycle SemVer. Je ne veux justement pas confondre « version du bootstrap » et « version de la workstation ».

## Je préfère SemVer à « stable »

J’avais commencé à parler de channels `stable` et `pilot`, puis je me suis rendu compte que ça ne suffisait pas.

Un channel dit à qui je propose une release.

Il ne dit pas ce qu’est cette release.

Je préfère donc donner une vraie version à la configuration workstation elle-même : `2.6.1`, `2.7.0-pilot.1`, `2.7.0`, etc.

Le channel reste utile pour décider qu’un petit groupe peut voir les prereleases alors que le reste du parc reste sur la dernière stable.

Mais la release, elle, garde une identité propre.

Et je conserve évidemment le SHA exact derrière la version. SemVer est pratique pour parler entre humains ; le commit reste la provenance technique.

## Le registry privé tourne maintenant

Pour aller vite, le premier pilote construisait depuis le snapshot Nix embarqué dans le package, ou depuis le checkout Git sur les postes Tech.

C’était utile pour valider la chaîne, mais je ne voulais pas en faire le modèle de distribution.

Depuis, j’ai branché un vrai registry de profils dans Azure Blob. Le container est privé et Setup y accède avec un token Entra dédié à Azure Storage. Pas de SAS dans l’application, pas de lecture anonyme.

Le layout reste volontairement simple :

~~~text
workstation-profiles/
  channels/
    pilot/
      tech.json
      direction.json
      standard.json

  releases/
    0.1.0/
      tech/
        manifest.json
        aarch64-darwin/
          profile.json
          closure.nar.zst
~~~

Le channel pointer dit quelle version regarder. Le manifest décrit les artefacts. Le `profile.json` contient le rôle, le store path et quelques métadonnées nécessaires à l’activation.

Le canal pilote `0.1.0` est déjà publié et résolu par l’app après l’auth Entra.

## Le Mac peut maintenant consommer une closure prébuildée

Le chemin d’import est lui aussi câblé.

Quand une release contient réellement `closure.nar.zst`, Setup la télécharge dans son cache, vérifie son SHA-256, puis transmet au helper le chemin de la closure et le store path attendu.

Le helper fait alors :

~~~text
closure.nar.zst
   -> zstd
   -> nix-store --import
   -> set profile
   -> activate
   -> validate
~~~

Si le registry ne contient pas encore la closure, le moteur garde le build local comme fallback. Ça me permet de migrer progressivement sans casser le pilote.

Au moment où j’écris ces lignes, le registry live contient déjà les manifests et les `profile.json`. Le chemin export/import NAR est implémenté, et j’ai justement dû corriger le script de publication parce que le `nix-store --export` de Determinate ne consommait pas mes paths sur stdin comme je l’avais supposé. L’export passe maintenant les store paths comme arguments avant compression en zstd.

Je suis encore en train de valider la première publication complète des closures sur le canal pilote. Je préfère écrire ça comme ça plutôt que de faire croire que toute la supply chain est terminée.

## Entra remplace la clé statique

L’application vient déjà d’authentifier l’utilisateur.

Je réutilise donc cette identité pour demander un token Azure Storage et lire le container privé avec du RBAC. Le rôle workstation et le droit de lire le Blob restent deux contrôles distincts.

C’est exactement ce que je voulais : Git reste la source, Azure distribue les releases, mais aucun secret de stockage n’est embarqué dans le Mac.

Il reste un point de sécurité que je n’ai volontairement pas masqué : le pilote accepte encore des manifests non signés. Le verifier Ed25519 existe comme squelette, mais l’enforcement n’est pas encore activé.

Le prochain état cible est donc bien :

~~~text
Entra/RBAC
   -> qui peut lire

Ed25519
   -> quel manifest le helper accepte d’appliquer
~~~

Deux problèmes différents, deux contrôles différents.

## Je veux aussi connaître le coût disque avant de télécharger

C’est là que le sujet devient plus concret.

Une closure Nix n’est pas forcément petite. Sur un Mac de 512 Go, télécharger plusieurs générations complètes sans stratégie de rétention peut devenir idiot assez vite.

Le manifest doit donc contenir suffisamment d’informations pour que l’app sache avant le téléchargement si l’update est raisonnable : taille compressée, taille de closure, version minimum du bootstrap, version minimum de macOS, digest de l’artefact.

Pas besoin d’un protocole énorme. Juste assez pour éviter de découvrir à 95 % du téléchargement qu’il manque 20 Go.

## Et surtout, garder un vrai rollback

Je veux toujours pouvoir revenir à la dernière génération connue comme bonne.

La politique que j’ai retenue est donc assez simple : garder la version courante et la `previous-known-good`. Le reste peut devenir éligible au garbage collection une fois que la nouvelle version a été activée et validée.

Je ne veux surtout pas lancer un GC agressif avant cette validation.

Sinon, on transforme le mécanisme de rollback en décoration.

C’est aussi pour ça que je préfère que l’application connaisse les versions appliquées et les store paths protégés plutôt que de laisser un cron Nix faire le ménage tout seul dans son coin.

## Au fond, ça ressemble beaucoup à une supply chain logicielle

C’est probablement le point qui m’intéresse le plus dans tout ça.

Je ne cherche pas à faire un « super MDM ». Je cherche surtout à traiter le poste comme un artefact que je peux fabriquer, identifier, vérifier, déployer et reprendre.

La source reste dans Git.

Le build produit quelque chose de précis.

Le stockage distribue.

Entra autorise.

L’application orchestre.

Nix applique.

Et si ça casse, je sais quelle version j’essaie de poser et vers laquelle je peux revenir.

Ça me paraît beaucoup plus sain que « relance le script d’update et regarde si ça passe ».

La théorie est assez jolie. Évidemment, le premier Mac réellement effacé m’a rapidement rappelé qu’entre le diagramme et la machine il y a `appstored`, PackageKit, des claims Entra incomplets, Homebrew qui n’existe pas et quelques autres détails sympathiques.

C’est la dernière partie.

## Suite

5/5 : **Ce qui casse quand on essaie vraiment de provisionner un Mac de zéro** — publication la semaine prochaine.

## Sources officielles

- [Semantic Versioning](https://semver.org/)
- [Nix manual : store](https://nix.dev/manual/nix/latest/store/)
- [NixOS Wiki : Binary Cache](https://wiki.nixos.org/wiki/Binary_Cache)
- [Microsoft : Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/azure/storage/blobs/authorize-access-azure-active-directory)
