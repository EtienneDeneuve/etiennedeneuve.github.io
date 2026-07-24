# Migration collections Astro

## Objectif

Introduire les nouvelles collections (`articles`, `projects`, `caseStudies`, `appearances`, `resources`) sans supprimer ni ignorer silencieusement le contenu historique.

## Compatibilite assuree

- Les contenus existants dans `src/content/blog/*` restent lisibles via la collection legacy `blog`.
- La nouvelle collection `articles` est disponible pour migration progressive.
- Les contenus `resources/*` existants sont normalises vers le nouveau modele (`resourceKind`) sans casser le frontmatter historique.
- Les contenus `caseStudies/*` existants sont mappes vers le nouveau schema publiable.
- Les anciennes metriques libres (dictionnaire) sont transformees en tableau structure et forcent `draft: true` tant qu'elles ne sont pas verifiees.

## Regle de publication case study

- `draft: true` => non publie.
- Si une metrique a `verified: false`, l'etude reste en `draft`.
- Une etude ne peut etre publiee que si toutes les metriques sont verifiees.

## Migration progressive blog → thinking

1. Analyser et générer la table de redirections (sans modifier le corps des articles) :

   ```bash
   pnpm run migrate:thinking-routes
   ```

   Produit `src/data/thinking-redirects.json` et `docs/thinking-migration-report.md`.

2. Enrichir manuellement le frontmatter (`pillar`, `contentType`, `description`, `relatedProjects`).

3. Déplacer progressivement les fichiers vers `src/content/articles/` lorsque le frontmatter est revu.

## Réécriture éditoriale (MLX MoE local)

Pour repositionner les posts legacy vers la voix Thinking **sans tokens cloud** (défaut : Qwen3.5-35B-A3B OptiQ via `mlx_lm.server`) :

voir [`article-rewrite.md`](./article-rewrite.md) et le brief [`editorial-rewrite-prompt.md`](./editorial-rewrite-prompt.md).

```bash
# via devenv (recommandé)
direnv allow && mlx-serve

# ou sans devenv
uvx --from mlx-lm mlx_lm.server \
  --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit \
  --port 18080
bun run rewrite:articles:status
bun run rewrite:articles:triage -- --limit 5
bun run rewrite:articles:rewrite -- --limit 1
```

Les drafts sortent sous `~/Worklog/content/rewrites/` — jamais directement dans `src/content/blog/`.
