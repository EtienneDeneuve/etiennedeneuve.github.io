{ pkgs, ... }:

# Personal site + local article rewrite (Kev triage + MLX MoE drafts).
# Enter: direnv allow   or   devenv shell
{
  dotenv.enable = false;

  # Same binary cache as sanad / scalion-next — avoid rebuilding devenv tools from source.
  cachix.pull = [ "devenv" ];

  packages = with pkgs; [
    bun
    uv
    git
    jq
    nodejs_22
    curl
  ];

  env = {
    TRIAGE_BACKEND = "kev";
    REWRITE_BACKEND = "mlx";
    MLX_BASE_URL = "http://127.0.0.1:18080/v1";
    # MoE OptiQ — sweet spot M2 Max 64GB (~20–24 Go, ~3B actifs)
    TRIAGE_MODEL = "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit";
    REWRITE_MODEL = "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit";
    # 18080 — avoid clash with scalion-audit / other stacks on :8080
    MLX_PORT = "18080";
    # Kev decision model (triage) — checkout via kev-bootstrap
    KEV_BASE_URL = "http://127.0.0.1:8009";
    KEV_PORT = "8009";
    KEV_MODEL = "jaredpalmer/kev-4b";
    KEV_REPO = "https://github.com/jaredpalmer/kev.git";
  };

  scripts = {
    site-doctor = {
      description = "Versions + Kev triage + MLX rewrite readiness";
      exec = ''
        set -euo pipefail
        kev_root="''${KEV_ROOT:-$HOME/.cache/etienne-site/kev}"
        kev_url="''${KEV_BASE_URL:-http://127.0.0.1:8009}"
        echo "=== etienne.deneuve.xyz devenv ==="
        printf '  %-12s %s\n' bun "$(bun --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' node "$(node --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' uv "$(uv --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' git "$(git --version 2>/dev/null | head -1 || echo missing)"
        echo ""
        echo "TRIAGE_BACKEND=$TRIAGE_BACKEND"
        echo "REWRITE_BACKEND=$REWRITE_BACKEND"
        echo "KEV_BASE_URL=$kev_url"
        echo "KEV_MODEL=$KEV_MODEL"
        echo "KEV_ROOT=$kev_root"
        echo "MLX_BASE_URL=$MLX_BASE_URL"
        echo "REWRITE_MODEL=$REWRITE_MODEL"
        echo ""
        if [[ -d "$kev_root/.git" ]]; then
          echo "Kev checkout: OK ($kev_root)"
        else
          echo "Kev checkout: missing — run: kev-bootstrap"
        fi
        if curl -sf "$kev_url/v1/models" >/dev/null 2>&1; then
          echo "Kev server:  OK ($kev_url)"
        else
          echo "Kev server:  down — run: kev-bootstrap && kev-serve"
        fi
        if curl -sf "$MLX_BASE_URL/models" >/dev/null 2>&1; then
          echo "MLX server:  OK ($MLX_BASE_URL)"
        else
          echo "MLX server:  down — run: mlx-serve (needed for rewrite/annotate drafts)"
        fi
        if curl -sf "''${OLLAMA_HOST:-http://127.0.0.1:11434}/api/tags" >/dev/null 2>&1; then
          echo "Ollama:      OK (fallback available)"
        else
          echo "Ollama:      down (optional)"
        fi
      '';
    };

    kev-bootstrap = {
      description = "Clone jaredpalmer/kev into cache and uv sync --extra serve";
      exec = ''
        set -euo pipefail
        kev_root="''${KEV_ROOT:-$HOME/.cache/etienne-site/kev}"
        repo="''${KEV_REPO:-https://github.com/jaredpalmer/kev.git}"
        mkdir -p "$(dirname "$kev_root")"
        if [[ ! -d "$kev_root/.git" ]]; then
          echo "Cloning $repo → $kev_root"
          git clone --depth 1 "$repo" "$kev_root"
        else
          echo "Kev already cloned at $kev_root"
        fi
        cd "$kev_root"
        echo "uv sync --extra serve …"
        uv sync --extra serve
        echo "Ready. Start with: kev-serve"
      '';
    };

    kev-serve = {
      description = "Serve Kev decision model (System One API on KEV_PORT)";
      exec = ''
        set -euo pipefail
        kev_root="''${KEV_ROOT:-$HOME/.cache/etienne-site/kev}"
        port="''${KEV_PORT:-8009}"
        model="''${KEV_MODEL:-jaredpalmer/kev-4b}"
        if [[ ! -d "$kev_root/.git" ]]; then
          echo "Kev checkout missing at $kev_root — run: kev-bootstrap" >&2
          exit 1
        fi
        if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
          echo "Port :$port already in use:" >&2
          lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2 || true
          echo "Pick another: KEV_PORT=8010 kev-serve" >&2
          exit 1
        fi
        cd "$kev_root"
        echo "Starting Kev: $model on :$port (cwd=$kev_root)"
        exec uv run --extra serve python -m kev.serve --run "$model" --port "$port"
      '';
    };

    mlx-serve = {
      description = "Serve Qwen3.5 MoE OptiQ via uvx + mlx-lm (OpenAI API on MLX_PORT)";
      exec = ''
        set -euo pipefail
        port="''${MLX_PORT:-18080}"
        if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
          echo "Port :$port already in use:" >&2
          lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2 || true
          echo "Pick another: MLX_PORT=18081 mlx-serve" >&2
          exit 1
        fi
        echo "Starting MLX server: $REWRITE_MODEL on :$port"
        exec uvx --from mlx-lm mlx_lm.server \
          --model "$REWRITE_MODEL" \
          --port "$port"
      '';
    };

    rewrite-status = {
      description = "Article rewrite inventory (legacy vs modern)";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles:status
      '';
    };

    rewrite-triage = {
      description = "Triage legacy articles via Kev (pass extra args after --)";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles -- triage "$@"
      '';
    };

    rewrite-benchmark = {
      description = "Score triage against evals/triage-gold-v1.json (--threshold / --gold)";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles -- benchmark "$@"
      '';
    };

    rewrite-quality = {
      description = "Mechanical + AI-voice quality inventory for blog posts";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles -- quality "$@"
      '';
    };

    rewrite-draft = {
      description = "Rewrite triaged articles (pass --limit / --slug after --)";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles -- rewrite "$@"
      '';
    };
  };

  enterShell = ''
    echo "etienne.deneuve.xyz — site-doctor | kev-bootstrap | kev-serve | mlx-serve | rewrite-status | rewrite-quality | rewrite-triage | rewrite-benchmark | rewrite-draft"
  '';
}
