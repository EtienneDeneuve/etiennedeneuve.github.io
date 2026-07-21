import type { ConversionEvent } from "../config/conversion.ts";
import { conversionEvents } from "../config/conversion.ts";

export type { ConversionEvent };

export type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsProps = Record<string, AnalyticsPrimitive>;

export type AnalyticsProvider = {
  track: (event: ConversionEvent, props: AnalyticsProps) => void;
};

const PII_KEY =
  /^(email|e-mail|mail|name|fullname|phone|tel|mobile|address|message|body|subject|ip|user|userid|user_id|username)$/i;

declare global {
  interface Window {
    __siteAnalyticsProvider?: AnalyticsProvider;
    CookieConsent?: {
      acceptedCategory?: (category: string) => boolean;
    };
    dataLayer?: unknown[];
  }
}

function isConversionEvent(value: string): value is ConversionEvent {
  return (conversionEvents as readonly string[]).includes(value);
}

/**
 * Strip personal data from event properties.
 * Only allow short non-identifying keys (intent, surface, lang, etc.).
 */
export function sanitizeAnalyticsProps(props?: Record<string, unknown> | null): AnalyticsProps {
  if (!props) return {};
  const clean: AnalyticsProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (PII_KEY.test(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      if (value.length > 64) continue;
      if (value.includes("@")) continue;
      clean[key] = value;
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    }
  }
  return clean;
}

/** Attributes for ConversionCTA / links — no provider coupling. */
export function analyticsAttrs(
  event: ConversionEvent,
  props?: Record<string, unknown>
): Record<string, string> {
  const clean = sanitizeAnalyticsProps(props);
  const attrs: Record<string, string> = {
    "data-analytics-event": event,
  };
  if (Object.keys(clean).length > 0) {
    attrs["data-analytics-props"] = JSON.stringify(clean);
  }
  return attrs;
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof window.CookieConsent?.acceptedCategory === "function") {
      return window.CookieConsent.acceptedCategory("analytics") === true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Track a conversion event. Never throws. Never blocks navigation.
 * No-op without consent or without a registered provider (dataLayer push is optional best-effort).
 */
export function trackConversion(event: ConversionEvent, props?: Record<string, unknown>): void {
  try {
    if (!hasAnalyticsConsent()) return;
    const clean = sanitizeAnalyticsProps(props);

    window.__siteAnalyticsProvider?.track(event, clean);

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event,
        ...clean,
      });
    }
  } catch {
    // Swallow — analytics must never break UX.
  }
}

/** Register a future provider (Plausible, GA4, etc.) without touching components. */
export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  if (typeof window === "undefined") return;
  window.__siteAnalyticsProvider = provider;
}

let delegationBound = false;

/**
 * Capture clicks on `[data-analytics-event]` elements.
 * Safe to call multiple times.
 */
export function initAnalyticsDelegation(root: ParentNode = document): void {
  if (typeof window === "undefined" || delegationBound) return;
  delegationBound = true;

  root.addEventListener(
    "click",
    (event) => {
      try {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const el = target.closest("[data-analytics-event]");
        if (!el) return;
        const name = el.getAttribute("data-analytics-event");
        if (!name || !isConversionEvent(name)) return;
        let props: Record<string, unknown> = {};
        const raw = el.getAttribute("data-analytics-props");
        if (raw) {
          try {
            props = JSON.parse(raw) as Record<string, unknown>;
          } catch {
            props = {};
          }
        }
        trackConversion(name, props);
      } catch {
        // never block click / navigation
      }
    },
    { capture: true, passive: true }
  );
}
