# Design system — CTO conseil

## Direction

**CTO conseil** : graphite / ivoire / cuivre pour le hub perso. Tokens inspirés de la DA kit historique (`docs/branding/cto-cursor-kit/`), composition home définie par le plan D2.

**Outfit** (UI + display). **IBM Plex Mono** (code uniquement).

## Surfaces

| Motif                                           | Usage                                             |
| ----------------------------------------------- | ------------------------------------------------- |
| `.btn-primary` / `.btn-secondary` / `.btn-text` | CTA                                               |
| `.home-*`                                       | Composition home (bande sombre + approche ivoire) |
| `.site-nav`                                     | Header non sticky, fond graphite                  |
| `.surface` / `.surface-card`                    | Cartes secondaires (thinking, work)               |

## Tokens

| Groupe                    | Exemples                                    |
| ------------------------- | ------------------------------------------- |
| Accent light              | `--accent-regular` cuivre `#A54822`         |
| Accent dark / on graphite | `--accent-on-dark` `#F0AA78`                |
| Fonds                     | `--paper` `#F3EFE7`, `--graphite` `#111416` |
| Radius                    | `--radius-md: 6px`                          |
| Fonts                     | `--font-display` / `--font-body` Outfit     |

## Contraintes

- Omnivya secondaire, jamais hero brand
- FR/EN parity sur UI ; empty EN explicite pour publications
- Header non sticky ; TOC article peut rester sticky desktop
- Focus visible, touch ≥44px
- `prefers-reduced-motion` respecté
- Pas d’import runtime du kit JSON
