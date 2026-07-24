{ pkgs, ... }:

# Personal site + local article rewrite (MLX MoE via uvx).
# Enter: direnv allow   or   devenv shell
{
  dotenv.enable = false;

  packages = with pkgs; [
    bun
    uv
    git
    jq
    nodejs_22
  ];

  env = {
    REWRITE_BACKEND = "mlx";
    MLX_BASE_URL = "http://127.0.0.1:18080/v1";
    # MoE OptiQ — sweet spot M2 Max 64GB (~20–24 Go, ~3B actifs)
    TRIAGE_MODEL = "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit";
    REWRITE_MODEL = "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit";
    # 18080 — avoid clash with scalion-audit / other stacks on :8080
    MLX_PORT = "18080";
  };

  scripts = {
    site-doctor = {
      description = "Versions + rewrite backend readiness";
      exec = ''
        set -euo pipefail
        echo "=== etienne.deneuve.xyz devenv ==="
        printf '  %-12s %s\n' bun "$(bun --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' node "$(node --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' uv "$(uv --version 2>/dev/null || echo missing)"
        printf '  %-12s %s\n' git "$(git --version 2>/dev/null | head -1 || echo missing)"
        echo ""
        echo "REWRITE_BACKEND=$REWRITE_BACKEND"
        echo "MLX_BASE_URL=$MLX_BASE_URL"
        echo "REWRITE_MODEL=$REWRITE_MODEL"
        echo ""
        if curl -sf "$MLX_BASE_URL/models" >/dev/null 2>&1; then
          echo "MLX server: OK ($MLX_BASE_URL)"
        else
          echo "MLX server: down — run: mlx-serve"
        fi
        if curl -sf "''${OLLAMA_HOST:-http://127.0.0.1:11434}/api/tags" >/dev/null 2>&1; then
          echo "Ollama:     OK (fallback available)"
        else
          echo "Ollama:     down (optional)"
        fi
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
      description = "Triage legacy articles (pass extra args after --)";
      exec = ''
        set -euo pipefail
        cd "''${DEVENV_ROOT:-.}"
        exec bun run rewrite:articles -- triage "$@"
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
    echo "etienne.deneuve.xyz — site-doctor | mlx-serve | rewrite-status | rewrite-triage | rewrite-draft"
  '';
}
