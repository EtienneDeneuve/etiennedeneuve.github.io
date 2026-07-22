# Design system — Atelier

## Direction

**Atelier** : premium raffiné pour un hub doctrine tech. Pierre `#FAFAF9` / encre `#0C0A09` /
accent or `#A16207` (palette Luxury/Premium ui-ux-pro-max). Pas de teal Shine, pas de glass SaaS,
pas de mode terminal.

**Cormorant** (display) · **Outfit** (UI) · **IBM Plex Mono** (code uniquement).

## Surfaces

| Classe / motif                    | Usage                                      |
| --------------------------------- | ------------------------------------------ |
| `.btn-primary` / `.btn-secondary` | CTA (radius 8px, ombre douce)              |
| Home `.atelier-*`                 | Hero glow, preuve lead, feed, close sombre |
| `.surface` / `.surface-card`      | Cartes secondaires                         |

## Tokens

| Groupe  | Exemples                                                        |
| ------- | --------------------------------------------------------------- |
| Accent  | `--accent-regular` or `#A16207` / dark `#EAB308`                |
| Radius  | `--radius-md: 8px`, `--radius-lg: 14px`                         |
| Shadows | `--shadow-sm/md/lg` soft                                        |
| Fonts   | `--font-display` Cormorant, `--font-body` Outfit, `--font-mono` |
| Motion  | rise ~280ms, `prefers-reduced-motion`                           |

## Contraintes

- Omnivya secondaire, jamais hero brand
- FR/EN parity
- Focus visible, touch ≥44px
