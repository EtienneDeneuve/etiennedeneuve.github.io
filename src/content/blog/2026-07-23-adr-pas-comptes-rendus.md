---
title: "Les ADR ne sont pas des comptes rendus de réunion"
description: "Une migration de plateforme peut être parfaitement documentée et rester impossible à piloter. Le guide décrit les étapes, le diagramme montre la cible, les tickets répartissent…"
pubDate: 2026-12-29T09:00:00.000Z
language: fr
contentType: doctrine
pillar: observability
audience:
  - engineering-leads
  - engineers
tags:
  - Observability
  - Platform Engineering
  - GitOps
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-07-13-de-la-metrique-au-runbook
  - 2026-07-13-rendre-observables-agents-ci-ephemeres
---


Une migration de plateforme peut être parfaitement documentée et rester impossible à piloter. Le guide décrit les étapes, le diagramme montre la cible, les tickets répartissent le travail — mais personne ne sait répondre simplement à trois questions : qu’avons-nous décidé, pourquoi, et qu’est-ce qui nous ferait changer d’avis ?

C’est précisément le rôle d’un Architecture Decision Record, ou ADR. Pourtant, beaucoup d’ADR deviennent des comptes rendus de réunion légèrement mieux mis en page : liste des participants, historique des discussions, objections successives, compromis implicites. On y retrouve le chemin parcouru, mais pas nécessairement la décision qui doit orienter les prochains mois.

Un bon ADR ne conserve pas la conversation. Il rend une décision réfutable, transmissible et opérable.

## Le mauvais réflexe : tout conserver dans un seul document

Lorsqu’une équipe prépare une migration, elle produit souvent un document central. Celui-ci commence comme une stratégie, puis absorbe progressivement la procédure, les contraintes, les réponses aux commentaires de revue, les cas particuliers et les commandes de validation. À chaque objection, on ajoute un paragraphe. À chaque incertitude, une nouvelle section.

Le document paraît plus complet, mais il remplit désormais plusieurs fonctions incompatibles :

- expliquer pourquoi une direction a été choisie ;
- indiquer comment exécuter la migration ;
- servir de référence opérationnelle après le basculement ;
- conserver la trace des débats passés.

Ces contenus n’ont ni la même durée de vie ni le même lectorat. Une décision d’architecture doit rester stable tant que ses hypothèses tiennent. Un guide de migration évolue au rythme de l’exécution. Un runbook change avec l’exploitation. Quant au débat, il appartient à l’historique de revue, pas au contrat d’architecture.

Les mélanger crée une dette documentaire subtile. Lorsqu’une procédure change, on ne sait plus si la décision a changé. Lorsqu’un choix est contesté, la discussion se disperse dans les détails d’implémentation. Et lorsqu’une nouvelle personne rejoint le chantier, elle doit reconstituer la conclusion à partir d’un récit chronologique.

## Le bon modèle mental : décision, preuve, exécution

Je préfère distinguer trois objets reliés, mais indépendants.

**La décision** définit l’autorité. Elle formule le choix, son périmètre et ses conséquences. Par exemple : pour une préoccupation donnée, quel système fait foi ? Qui possède la configuration ? Où se trouve la frontière entre packaging, déclaration et promotion ?

**La preuve** rend le choix réfutable. Elle rassemble les hypothèses, les options écartées, les critères de succès et les signaux qui invalideraient la décision. Une objection sérieuse n’est pas enterrée dans une annexe : elle devient soit une contrainte acceptée, soit une expérience à mener, soit un motif explicite de révision.

**L’exécution** décrit le chemin. Elle appartient au guide de migration : séquence, contrôles, stratégie de retour arrière, traitement des exceptions et état d’avancement.

L’ADR est le lien entre ces trois objets, pas leur conteneur universel. Il dit : « voici l’autorité retenue, sur la base de ces éléments, et voici le guide qui applique cette décision ». Cette séparation permet au guide de changer sans réouvrir artificiellement l’architecture, et à l’architecture d’être réexaminée sans réécrire toute la procédure.

## Une décision courte n’est pas une décision simpliste

La brièveté d’un ADR ne vient pas d’un manque de profondeur. Elle vient d’un travail de compression.

Un ADR utile peut généralement répondre à six questions :

1. **Quel problème exige une décision ?** Pas le projet entier, mais la tension précise à résoudre.
2. **Quel est le périmètre ?** Une décision sans frontière devient une règle générale par accident.
3. **Quel choix faisons-nous ?** Une phrase déclarative, sans ambiguïté sur l’option retenue.
4. **Pourquoi ce choix maintenant ?** Les contraintes et hypothèses déterminantes, pas la transcription du débat.
5. **Quelles conséquences acceptons-nous ?** Bénéfices, coûts, responsabilités et renoncements.
6. **Qu’est-ce qui déclencherait une révision ?** Mesures, nouvelles contraintes ou échec d’une hypothèse.

Cette dernière question est essentielle. Une décision qui ne peut jamais être invalidée relève de la doctrine. Une décision qui peut être réouverte à chaque préférence individuelle n’en est pas une. L’ADR doit établir une stabilité conditionnelle : on suit le choix tant que les hypothèses et critères restent vrais.

C’est ce qui rend la décision à la fois ferme et réfutable.

## Transformer les objections en tests

Les revues d’architecture se dégradent souvent lorsque les objections restent formulées comme des opinions : « ce sera plus difficile à tester », « cette solution est trop centralisée », « nous allons perdre en autonomie ». Ces inquiétudes peuvent être légitimes, mais elles ne permettent pas de trancher.

Le travail de l’ADR consiste à les convertir en propositions vérifiables.

« Plus difficile à tester » devient : quels contrôles doivent pouvoir être exécutés avant fusion ? Sur quel périmètre ? Avec quel délai de retour ? « Trop centralisé » devient : quelle équipe doit pouvoir modifier quel objet sans dépendre d’une autre ? « Perte d’autonomie » devient : quelle opération courante nécessiterait désormais une escalade ?

Cette reformulation produit deux effets. D’abord, elle améliore la décision présente, car les options peuvent être comparées sur des critères communs. Ensuite, elle prépare sa révision future : si les critères ne sont plus satisfaits, l’équipe dispose d’un motif factuel pour rouvrir l’ADR.

Une objection réfutée ne doit pas disparaître. Elle doit laisser une trace concise : l’hypothèse examinée, la preuve retenue et la condition qui justifierait de la reconsidérer. C’est bien plus utile qu’un verbatim de réunion.

## Relier l’ADR au guide sans les confondre

Dans une migration de plateforme, l’ADR et le guide doivent évoluer en tandem.

L’ADR fixe les invariants : source d’autorité par préoccupation, modèle de responsabilité, contraintes de compatibilité, conditions de réversibilité. Le guide transforme ces invariants en étapes. Chaque étape importante devrait pouvoir être reliée à une décision ; chaque conséquence opérationnelle de l’ADR devrait apparaître quelque part dans le guide.

On obtient alors une chaîne lisible :

**problème → décision → conséquence → contrôle**.

Si une étape n’est reliée à aucune décision, elle est peut-être accidentelle ou trop spécifique. Si une décision n’entraîne aucun contrôle observable, elle est probablement trop abstraite. Si un contrôle échoue sans remettre en cause ni la procédure ni l’hypothèse, il ne contrôle rien d’utile.

Cette chaîne est particulièrement précieuse quand plusieurs équipes interviennent. Elle évite que « source de vérité », « responsabilité » ou « conformité » restent des slogans. Ces termes doivent désigner une autorité concrète et une manière de vérifier qu’elle est respectée.

## Comment reconnaître un ADR sain

Avant d’accepter un ADR, je vérifie quelques propriétés simples :

- sa décision peut être citée sans raconter toute la réunion ;
- son périmètre indique aussi ce qu’elle ne décide pas ;
- les options écartées le sont pour des raisons explicites ;
- les objections importantes sont devenues des critères ou des tests ;
- les responsabilités résultant du choix sont nommées ;
- un guide séparé porte la séquence d’exécution ;
- les conditions de révision sont observables ;
- son statut est clair : proposé, accepté, remplacé ou abandonné.

Un ADR qui satisfait ces critères devient une interface organisationnelle. Les équipes n’ont pas besoin de partager toute l’histoire du chantier pour agir de manière cohérente. Elles partagent une décision, ses limites et ses preuves.

## Au-delà des migrations

Ce modèle ne s’applique pas seulement aux plateformes ou à GitOps. Il fonctionne partout où une organisation doit stabiliser un choix sans prétendre qu’il sera éternel : sélection d’un collecteur d’observabilité, frontière d’un domaine métier, stratégie d’idempotence, mode d’intégration, politique de conservation des données.

Dans tous ces cas, l’ADR réduit le coût de coordination. Il évite de rejouer les mêmes débats, mais surtout il empêche une décision passée de devenir inexplicable. Sa valeur n’est pas documentaire au sens archivistique ; elle est opérationnelle. Il permet à une personne absente de la réunion de comprendre ce qui fait foi et de contester le choix avec de nouvelles preuves plutôt qu’avec une nouvelle préférence.

C’est pourquoi les ADR ne sont pas des comptes rendus de réunion. Un compte rendu raconte ce qui s’est dit. Un ADR établit ce qui doit guider l’action, dans quelles limites, et jusqu’à preuve du contraire.
