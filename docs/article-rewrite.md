# Réécriture locale des articles legacy (MLX / Ollama)

Pipeline pour repositionner les anciens posts `src/content/blog/` vers la voix Thinking **sans tokens cloud** et **sans écraser** les sources.

Les drafts combinent **note Relecture 2026** (LLM) + **article d'origine** (copyedit léger ortho/format, titre et slug immuables).  
Le frontmatter Thinking est **assemblé par le script** (pas par le modèle).

## Devenv (Nix)

```bash
cd /path/to/etiennedeneuve.github.io
direnv allow          # ou: devenv shell
site-doctor
mlx-serve             # terminal 1 — uvx + mlx-lm
rewrite-status        # terminal 2
rewrite-triage -- --limit 5
rewrite-draft -- --limit 1
```

Fichiers : `devenv.nix`, `devenv.yaml` (nixpkgs via **FlakeHub weekly** / CDN Determinate), `.envrc`.

> `cachix/devenv-nixpkgs` tire quand même `NixOS/nixpkgs` en sous-input → gros tarball GitHub. FlakeHub évite ça.

## Prérequis MLX (sans devenv)

```bash
# Serveur OpenAI-compatible — uvx, pas pip
uvx --from mlx-lm mlx_lm.server \
  --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit \
  --port 18080
```

| Rôle                         | Modèle MLX                                 | ~RAM                  |
| ---------------------------- | ------------------------------------------ | --------------------- |
| Triage + réécriture (défaut) | `mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit` | ~20–24 Go (3B actifs) |
| Triage rapide (optionnel)    | `mlx-community/Qwen3.5-9B-4bit`            | ~7 Go                 |

Un seul serveur suffit avec le défaut OptiQ. Pour un triage 9B en parallèle :

```bash
uvx --from mlx-lm mlx_lm.server \
  --model mlx-community/Qwen3.5-9B-4bit \
  --port 18081
MLX_BASE_URL=http://127.0.0.1:18081/v1 TRIAGE_MODEL=mlx-community/Qwen3.5-9B-4bit \
  bun run rewrite:articles:triage
```

### Fallback Ollama

```bash
ollama pull qwen3.5:9b
ollama pull qwen3.5:35b-a3b
REWRITE_BACKEND=ollama bun run rewrite:articles:status
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

Env : `REWRITE_BACKEND`, `MLX_BASE_URL`, `TRIAGE_MODEL`, `REWRITE_MODEL`, `OLLAMA_HOST`, `WORKLOG_ROOT`.

Brief éditorial : [`editorial-rewrite-prompt.md`](./editorial-rewrite-prompt.md).

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
