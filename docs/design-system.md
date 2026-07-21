# Design system — Ink Doctrine

## Direction

**Ink Doctrine** : Swiss + éditorial technique. Contraste encre/papier, typographie IBM Plex,
accent unique, bords nets. Hub de doctrine et de preuves — pas un template SaaS.

Identité : papier `#F4F2EC` / encre `#0B0D10` / accent **Ink Signal** (encre, sans teal).
**IBM Plex Serif** (display) · **IBM Plex Sans** (UI) · **IBM Plex Mono** (meta / code).

## Surfaces partagées (`global.css`)

| Classe                                                      | Usage                                  |
| ----------------------------------------------------------- | -------------------------------------- |
| `.surface` / `.surface-card`                                | Cartes, preuves (bordure, pas d’ombre) |
| `.btn-primary` / `.btn-secondary` / `.btn-text`             | CTA rectangulaires                     |
| `.eyebrow` / `.lede` / `.page-hero` / `.brand-mark`         | En-têtes                               |
| `.badge` / `.grid-auto` / `.section-head` / `.section-rule` | Structure éditoriale                   |
| `.actions`                                                  | Groupes de CTA                         |

## Tokens

| Groupe   | Exemples                                                                    |
| -------- | --------------------------------------------------------------------------- |
| Surfaces | `--color-bg`, `--color-bg-elevated`, `--color-fg`, `--color-border`         |
| Accent   | `--accent-regular` = encre (light `#0B0D10` / dark `#F4F2EC`) — pas de teal |
| Radius   | `--radius-sm: 0`, `--radius-md: 2px`, `--radius-lg: 4px`                    |
| Shadows  | aucune (profondeur = bordure)                                               |
| Fonts    | `--font-display` (Plex Serif), `--font-body` (Plex Sans), `--font-mono`     |
| Motion   | `--motion-fast` ≈180ms, View Transitions ≤220ms                             |

Clair / sombre via `:root` et `:root.theme-dark`.

## Composants (`src/components/ds/`)

| Composant                    | Usage                             |
| ---------------------------- | --------------------------------- |
| `Callout`                    | note / warning / decision / proof |
| `QuoteBlock`                 | citations (serif)                 |
| `DecisionList`               | listes numérotées mono            |
| `DiagramFrame`               | SVG / mermaid                     |
| `CodePanel`                  | blocs de code                     |
| `ResponsiveTable`            | tables                            |
| `MediaFrame`                 | images anti-CLS                   |
| `ProofCard` / `ProjectPanel` | preuves / projets                 |

## Page de référence

`/design-system/` désactivée en prod sauf `PUBLIC_SHOW_DESIGN_SYSTEM=true`.

## Contraintes

- Pas de Tailwind / lib UI
- Pas de fonds photo ; pas de pills 999 ; pas de gradients CTA
- `prefers-reduced-motion` ; focus visible ; touch ≥44px
- Omnivya jamais hero brand sur le site personnel
