# Analytics & conversion events

## Principles

- Email is the primary conversion channel; booking calendar is secondary.
- Events never contain personal data (no email, name, message body, subject line).
- Tracking must never block navigation.
- Tracking runs only when the visitor accepted the **analytics** cookie category.
- Components emit events via `data-analytics-event` attributes — they do not import a vendor SDK.

## Abstraction

| File                                 | Role                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `src/lib/analytics.ts`               | Sanitize props, consent check, track, register provider, click delegation |
| `src/config/conversion.ts`           | Event name taxonomy + CTA wiring                                          |
| `src/components/ConversionCTA.astro` | Reusable CTA with analytics attributes                                    |
| `src/components/Analytics.astro`     | Mounts click delegation once (BaseLayout)                                 |

### Usage in components

```astro
---
import ConversionCTA from "./ConversionCTA.astro";
---

<ConversionCTA
  href="/contact/"
  event="cta_contact_email"
  props={{ intent: "mission", surface: "home" }}
>
  Discuter d'un contexte
</ConversionCTA>
```

Or on a plain link:

```astro
---
import { analyticsAttrs } from "../lib/analytics.ts";
---

<a href="/rss.xml" {...analyticsAttrs("cta_rss", { surface: "footer" })}>RSS</a>
```

### Future provider

Register once (e.g. in a client script after consent):

```ts
import { registerAnalyticsProvider } from "../lib/analytics.ts";

registerAnalyticsProvider({
  track(event, props) {
    // plausible / ga4 / posthog — no PII in props
  },
});
```

Components stay unchanged.

## Event taxonomy

| Event               | When                                   | Allowed props (examples)     |
| ------------------- | -------------------------------------- | ---------------------------- |
| `cta_start_here`    | Link to Start Here                     | `surface`, `lang`            |
| `cta_project_open`  | Open a project / Omnivya / product URL | `surface`, `project`, `lang` |
| `cta_contact_email` | Mailto or link to `/contact/`          | `surface`, `intent`, `lang`  |
| `cta_booking`       | Omnivya calendar secondary action      | `surface`, `lang`            |
| `cta_speaking`      | Speaking CTA / media kit               | `surface`, `lang`            |
| `cta_rss`           | RSS feed link                          | `surface`, `pillar`, `lang`  |
| `cta_github`        | GitHub repository / profile link       | `surface`, `repo`, `lang`    |

### Intent values for `cta_contact_email`

| `intent`         | Page meaning                 |
| ---------------- | ---------------------------- |
| `mission`        | Diagnostic or mission        |
| `partnership`    | Partnership                  |
| `speaking_media` | Conference or media          |
| `technical`      | Specific technical exchange  |
| `qualification`  | Generic / nav CTA            |
| `booking`        | Email fallback near calendar |

## Consent

- Cookie category: `analytics` (CookieConsent / astro-cookieconsent).
- Without consent: `trackConversion` is a no-op.
- Without registered provider: optional `dataLayer` push only if present; still no PII.

## What not to send

- Email addresses, names, phone numbers
- Mailto subject or body
- Free-text messages
- IP addresses or user IDs
- Any string longer than 64 characters (dropped by sanitizer)

## Contact page

Primary actions: four `mailto:` links with distinct subjects (`src/config/contact.ts`).  
Secondary action: Omnivya calendar URL from `siteConfig.omnivya.contactPage` — no Simplifi’ED / Outlook Bookings URL.
