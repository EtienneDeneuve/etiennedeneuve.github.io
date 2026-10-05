# Réécriture locale des articles legacy (Kev + MLX / Ollama)

Pipeline pour repositionner les anciens posts `src/content/blog/` vers la voix Thinking **sans tokens cloud** et **sans écraser** les sources.

- **Triage** (défaut) : [Kev](https://github.com/jaredpalmer/kev) — décisions `archive` / `annotate` / `rewrite` calibrées
- **Drafts** : note Relecture 2026 (MLX Qwen) + corps d’origine (copyedit léger) ; titre et slug immuables
- Frontmatter Thinking **assemblé par le script** (pas par le modèle)

## Devenv (Nix)

```bash
cd /path/to/etiennedeneuve.github.io
direnv allow          # ou: devenv shell
site-doctor

kev-bootstrap         # clone + uv sync (une fois)
kev-serve             # terminal 1 — triage System One :8009
mlx-serve             # terminal 2 — drafts seulement :18080

rewrite-status
rewrite-quality -- --before 2026-01-01   # mess / AI-voice / hard-archive hints
rewrite-benchmark          # score vs evals/triage-gold-v1.json (needs kev-serve)
rewrite-triage -- --before 2026-01-01 --limit 5
rewrite-draft -- --limit 1
```

Fichiers : `devenv.nix`, `devenv.yaml` (nixpkgs via **FlakeHub weekly** / CDN Determinate), `.envrc`.

> `cachix/devenv-nixpkgs` tire quand même `NixOS/nixpkgs` en sous-input → gros tarball GitHub. FlakeHub évite ça.

Checkout Kev hors repo : `~/.cache/etienne-site/kev` (`KEV_ROOT` pour override).

## Triage Kev

`TRIAGE_BACKEND=kev` (défaut devenv). Chaque article envoie un `POST /v1/systemone` avec :

| Question      | Type     | Rôle                         |
| ------------- | -------- | ---------------------------- |
| `decision`    | `choice` | archive / annotate / rewrite |
| `pillar`      | `choice` | enums Thinking               |
| `contentType` | `choice` | enums Thinking               |

Angle / rationale sont synthétiques (pas de prose libre Kev). Sortie inchangée sous `~/Worklog/content/rewrites/`.

Fallback LLM triage :

```bash
TRIAGE_BACKEND=mlx rewrite-triage -- --limit 5
# ou
TRIAGE_BACKEND=ollama REWRITE_BACKEND=ollama rewrite-triage -- --limit 5
```

## Prérequis MLX (drafts, sans devenv)

```bash
# Serveur OpenAI-compatible — uvx, pas pip
uvx --from mlx-lm mlx_lm.server \
  --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit \
  --port 18080
```

| Rôle              | Modèle                                     | ~RAM                  |
| ----------------- | ------------------------------------------ | --------------------- |
| Triage (défaut)   | `jaredpalmer/kev-4b` via `kev-serve`       | ~adapter + Qwen3.5-4B |
| Réécriture drafts | `mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit` | ~20–24 Go (3B actifs) |

### Fallback Ollama (triage LLM + drafts)

```bash
ollama pull qwen3.5:9b
ollama pull qwen3.5:35b-a3b
TRIAGE_BACKEND=ollama REWRITE_BACKEND=ollama bun run rewrite:articles:status
```

## Commandes

```bash
bun run rewrite:articles:status

bun run rewrite:articles:triage
bun run rewrite:articles -- triage --limit 5
bun run rewrite:articles -- triage --slug 2017-01-26-utiliser-ansible-et-azure-oui-cest-possible

bun run rewrite:articles -- rewrite --limit 1
bun run rewrite:articles -- annotate --slug …

# --before 2020-01-01  --force  --dry-run  --model <id>
```

Env : `TRIAGE_BACKEND`, `KEV_BASE_URL`, `KEV_MODEL`, `REWRITE_BACKEND`, `MLX_BASE_URL`, `TRIAGE_MODEL`, `REWRITE_MODEL`, `OLLAMA_HOST`, `WORKLOG_ROOT`.

Brief éditorial (drafts LLM) : [`editorial-rewrite-prompt.md`](./editorial-rewrite-prompt.md).

## Fichiers produits

| Chemin                                            | Contenu              |
| ------------------------------------------------- | -------------------- |
| `~/Worklog/content/rewrites/state.json`           | État par slug        |
| `~/Worklog/content/rewrites/triage/*.json`        | Décisions            |
| `~/Worklog/content/rewrites/drafts/rewrite-*.md`  | Drafts `draft: true` |
| `~/Worklog/content/rewrites/drafts/annotate-*.md` | Préambules           |

## Publication (humaine)

1. Relire le draft Worklog
2. Fusionner dans `src/content/blog/` (ou `articles/`) **à la main**
3. Frontmatter Thinking + bandeau « Relecture 2026 »
4. `bun run validate-publication` puis commit

Le script **n’écrit jamais** dans `src/content/blog/`.
