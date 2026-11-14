# Politique de preuve — etienne.deneuve.xyz

**Version :** 1.0  
**Date :** 2026-07-21  
**Implémentation :** `src/lib/publication-policy.ts`, intégration build `src/integrations/publication-policy.ts`

---

## Objectif

Ne publier que des preuves vérifiables. Toute affirmation de résultat, métrique ou capacité doit être traçable ou explicitement retenue.

---

## Niveaux de divulgation

| Niveau                 | Usage                                           |
| ---------------------- | ----------------------------------------------- |
| `public`               | Nom, contexte et preuves visibles publiquement  |
| `anonymized`           | Secteur et périmètre sans identification client |
| `confidential-summary` | Synthèse haut niveau sans détail opérationnel   |

---

## Types de preuve

Une preuve peut être :

- repository public (`public-repository`)
- documentation (`documentation`)
- article technique (`technical-article`)
- conférence enregistrée (`recorded-conference`)
- capture ou démonstration autorisée (`authorized-demo`)
- métrique vérifiée (`verified-metric`)
- témoignage autorisé (`authorized-testimonial`)
- produit accessible (`accessible-product`)
- architecture publiable (`publishable-architecture`)

Chaque preuve structurée doit avoir une **description**. Une **URL** est requise dès que la preuve est référencée comme obligatoire sur une étude publiée.

---

## Règles de build (erreurs)

Le build **échoue** si :

1. Un case study publié (`draft: false`) contient une métrique `verified: false`
2. Une preuve obligatoire n’a ni URL ni description
3. Un contenu publié contient : `Client A`, `Lorem ipsum`, `TODO`, `TBD`, `[PLACEHOLDER…]` ou équivalent

Commande manuelle : `bun run validate-publication`

Le script s’exécute automatiquement avant `bun run build` via `package.json`.

---

## Avertissements (non bloquants)

Le build **avertit** lorsqu’un résultat ou résumé contient une formulation absolue potentiellement non sourcée (pourcentages, « garanti », « toujours », etc.).

---

## Exclusions automatiques

Les contenus `draft: true` sont exclus de :

- pages statiques (`getStaticPaths`)
- listes (Thinking, Projects, Case Studies, homepage)
- RSS (`/rss.xml`)
- JSON-LD (`src/lib/json-ld.ts`)
- sitemap (pages draft non générées)

---

## Règle de publication croisée Étienne ↔ Omnivya

Pour un sujet technique suffisamment fort, la règle par défaut est de construire un **système de preuves complémentaires**, pas un duplicata multi-site.

Le mapping n’est **pas 1:1**. Le modèle préféré est **many-to-one** : plusieurs field notes / build stories Étienne peuvent alimenter une seule pièce Omnivya plus synthétique. En pratique, viser souvent **2 à 4 contenus Étienne pour 1 contenu Omnivya** lorsque les sujets convergent vers la même décision, le même risque ou le même operating model. Ce ratio est un guide éditorial, pas un quota.

### Étienne — retour terrain / build story

Le contenu personnel doit privilégier :

- le contexte réel ;
- ce qui a été essayé ;
- les décisions techniques ;
- les erreurs, limites et compromis ;
- les détails d’implémentation utiles ;
- un jugement technique assumé ;
- les preuves publiques disponibles.

Il répond principalement à : **« qu’est-ce qui s’est réellement passé, et pourquoi ai-je pris cette décision ? »**

### Omnivya — pattern transférable / lecture CTO

Le contenu Omnivya doit extraire du même sujet :

- le pattern généralisable ;
- la méthode de décision ;
- les risques et trade-offs ;
- les impacts exploitation, sécurité, coût ou organisation ;
- ce qu’Omnivya recommanderait ou éviterait ;
- les limites de généralisation.

Il répond principalement à : **« qu’est-ce qu’une autre organisation peut réutiliser de ce retour terrain ? »**

### Anti-duplication

- Ne pas republier le même texte sur les deux domaines.
- Ne pas paraphraser mécaniquement paragraphe par paragraphe.
- Conserver une source de faits commune, mais une thèse et une structure éditoriale distinctes.
- Cross-linker les deux publications lorsqu’elles existent.
- Le blog Étienne peut porter le détail / la chronologie ; Omnivya porte l’abstraction / le cadre de décision.
- Si le sujet ne justifie pas réellement deux angles, publier une seule pièce et faire un lien depuis l’autre site plutôt que fabriquer un doublon.
- Plusieurs articles Étienne peuvent être synthétisés en une seule publication Omnivya.
- Une publication Omnivya peut aussi naître d’un sujet de gouvernance, risque ou transformation sans équivalent personnel obligatoire.

---

## Règle de confidentialité produit

Les produits, projets et initiatives privés (par exemple produits internes, stealth ou clients) **ne sont pas des sujets éditoriaux directs**.

On peut utiliser leur existence comme source interne de compétence, mais le contenu public doit rester à un niveau d’abstraction qui ne permet pas de reconstituer le produit, sa roadmap, son moat, ses workflows distinctifs ou son architecture propriétaire.

### Ce qui peut être publié

- un problème générique rencontré ;
- un pattern d’architecture déjà largement applicable ailleurs ;
- une méthode de décision ;
- un compromis technique générique ;
- un KPI anonymisé et non attribuable, si sa publication est autorisée ;
- une leçon d’exploitation ou de gouvernance ;
- une référence à une technologie publique déjà connue.

### Ce qui ne doit pas être publié

- le nom du produit privé ou stealth ;
- sa proposition de valeur détaillée ;
- sa roadmap ;
- ses workflows métier distinctifs ;
- son modèle de données propriétaire ;
- ses algorithmes / heuristiques / corrélations spécifiques ;
- ses intégrations différenciantes ;
- son architecture suffisamment précise pour reproduire le produit ;
- des données permettant d’inférer un client ou un projet confidentiel.

### Test éditorial

Avant publication, vérifier : **si un concurrent lit l’article, peut-il comprendre comment reconstruire une partie significative du produit ou identifier sa stratégie ?**

Si oui, abstraire davantage ou ne pas publier.

---

## Brouillons éditoriaux

Les modèles non publiables vivent dans `src/content-drafts/` — **hors collections Astro**.

Exemple : anciennes études « Client A » dans `src/content-drafts/case-studies/`.

---

## Publication d’une case study

1. Rédiger dans `src/content/caseStudies/`
2. `draft: true` jusqu’à validation complète
3. Métriques avec `verified: true` et `source` explicite
4. `evidence` structurée avec `type`, `description`, `url`
5. `disclosureLevel` défini
6. `bun run validate-publication` puis `bun run build`

---

## Composants UI

| Composant               | Rôle                                                     |
| ----------------------- | -------------------------------------------------------- |
| `DisclosureBadge.astro` | Affiche le niveau de divulgation                         |
| `OutcomeMetric.astro`   | Affiche une métrique vérifiée (masque les non vérifiées) |
| `EvidenceList.astro`    | Liste les preuves structurées                            |

---

## État actuel

Aucune case study publiée. Un fichier `internal-template.md` (`draft: true`) maintient la collection active sans publication.

La page `/work/case-studies/` oriente vers `/projects/` et les articles techniques vérifiables.
