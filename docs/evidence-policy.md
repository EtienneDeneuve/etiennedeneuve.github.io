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

Pour un sujet technique suffisamment fort, la règle par défaut est de produire **deux contenus complémentaires**, pas un duplicata multi-site.

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
