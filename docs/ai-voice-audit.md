# Audit voix anti-IA (FR / EN)

**Date :** 2026-07-24  
**Sources scannées :** 182 fichiers  
**Pages HTML (dist) :** 0  
**Findings :** 6 (high 0 / medium 6 / low 0)

## Méthode

Heuristiques lexicales (tirets cadratin, amorces méta, buzzwords FR/EN).  
Ce n’est **pas** un juge stylistique absolu : chaque hit high/medium doit être relu humainement.

Relancer :

```bash
bun run audit:ai-voice
```

## Pages prioritaires (relecture FR/EN)

Ordre : home → start-here → about → thinking → work → projects → speaking → contact.

- [ ] `/`
- [ ] `/en/`
- [ ] `/start-here/`
- [ ] `/en/start-here/`
- [ ] `/about/`
- [ ] `/en/about/`
- [ ] `/work/`
- [ ] `/en/work/`
- [ ] `/thinking/`
- [ ] `/en/thinking/`
- [ ] `/projects/`
- [ ] `/en/projects/`
- [ ] `/speaking/`
- [ ] `/en/speaking/`
- [ ] `/contact/`
- [ ] `/en/contact/`

## Top règles

| Règle              | Hits |
| ------------------ | ---- |
| `en-dash-as-pause` | 5    |
| `fr-levier`        | 1    |

## Top fichiers

| Fichier                                                                 | Hits |
| ----------------------------------------------------------------------- | ---- |
| `src/config/about.ts`                                                   | 3    |
| `src/config/thinking.ts`                                                | 1    |
| `src/content/blog/2026-07-13-rendre-observables-agents-ci-ephemeres.md` | 1    |
| `src/content/resources/TechSpresso.md`                                  | 1    |

## Hits high (échantillon)

_Aucun hit high._

## Inventaire pages (dist)

_Pas de dist/ — lancer `bun run build` puis relancer l’audit._

## Checklist relecture humaine

Pour chaque page FR/EN prioritaire (home, start-here, about, work, thinking index, speaking, contact) :

1. Lire à voix haute 20 secondes : est-ce que ça sonne **parlé** ou **généré** ?
2. Supprimer tirets cadratin et transitions creuses.
3. Garder le jugement concret (contrainte → décision → preuve).
