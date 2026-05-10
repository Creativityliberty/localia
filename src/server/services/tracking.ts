// =====================================
// Localia — Tracking events service
// =====================================
// Insert anonyme via client public (RLS events_public_insert).
// Utilisé par les routes /api/events, /api/qr/[token]/scan,
// /api/ctas/[id]/click, et le formulaire lead.
// =====================================

import { getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import type { ParsedEventInput } from "@/server/validators";

export async function trackEvent(input: ParsedEventInput): Promise<void> {
  const client = getPublicClient();
  const db: any = (client as any).database ?? client;

  try {
    await db.from(TABLES.events).insert({
      business_id: input.businessId,
      site_id: input.siteId,
      anonymous_id: input.anonymousId,
      session_id: input.sessionId,
      name: input.name,
      cta_id: input.ctaId,
      qr_code_id: input.qrCodeId,
      service_id: input.serviceId,
      utm_source: input.utmSource,
      utm_medium: input.utmMedium,
      utm_campaign: input.utmCampaign,
      referrer: input.referrer,
      path: input.path,
      properties: input.properties ?? {},
    });
  } catch (err) {
    // On ne fait jamais échouer une requête publique à cause de l'analytics.
    console.warn("[localia] trackEvent failed:", err);
  }
}

/**
 * Track un évent simple par son nom (helper pour les routes).
 */
export async function trackSimpleEvent(
  businessId: string,
  name: string,
  options?: Partial<ParsedEventInput>,
): Promise<void> {
  await trackEvent({
    businessId,
    name,
    siteId: options?.siteId ?? null,
    ctaId: options?.ctaId ?? null,
    qrCodeId: options?.qrCodeId ?? null,
    serviceId: options?.serviceId ?? null,
    anonymousId: options?.anonymousId ?? null,
    sessionId: options?.sessionId ?? null,
    utmSource: options?.utmSource ?? null,
    utmMedium: options?.utmMedium ?? null,
    utmCampaign: options?.utmCampaign ?? null,
    referrer: options?.referrer ?? null,
    path: options?.path ?? null,
    properties: options?.properties ?? {},
  });
}
