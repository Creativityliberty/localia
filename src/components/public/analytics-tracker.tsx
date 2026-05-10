"use client";

import { useEffect } from "react";

const STORAGE_KEY = "localia_anonymous_id";
const SESSION_KEY = "localia_session_id";

function getAnonymousId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = `anon_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return `anon_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = `sess_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return `sess_${Math.random().toString(36).slice(2, 10)}`;
  }
}

interface AnalyticsTrackerProps {
  businessId: string;
  siteId: string;
}

export function AnalyticsTracker({ businessId, siteId }: AnalyticsTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        siteId,
        name: "page_view",
        anonymousId: getAnonymousId(),
        sessionId: getSessionId(),
        utmSource, utmMedium, utmCampaign,
        referrer: document.referrer || null,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});

    // Intercepter les clics sur les CTA tracés
    function handleCtaClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest("[data-cta-id]") as HTMLElement | null;
      if (!link) return;
      const ctaId = link.getAttribute("data-cta-id");
      if (!ctaId) return;

      // Fire and forget — keepalive permet à la requête de partir même si on quitte la page
      fetch(`/api/ctas/${ctaId}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          sessionId: getSessionId(),
          referrer: document.referrer || null,
          path: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    document.addEventListener("click", handleCtaClick);
    return () => document.removeEventListener("click", handleCtaClick);
  }, [businessId, siteId]);

  return null;
}
