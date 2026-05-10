import { NextResponse } from "next/server";
import { getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCta } from "@/server/db/mappers";
import { handleApiError } from "@/server/http/api-error";
import { trackSimpleEvent } from "@/server/services/tracking";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ctas/[id]/click
 *
 * Endpoint public : enregistre un clic sur un CTA et incrémente le compteur.
 * Permet aussi d'inférer le bon event name selon le type de CTA.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const client = getPublicClient();
    const db: any = (client as any).database ?? client;

    // Charger le CTA
    const result = await db
      .from(TABLES.ctas)
      .select("*")
      .eq("id", id)
      .eq("is_visible", true)
      .limit(1);

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) {
      return NextResponse.json({ data: { tracked: false } });
    }

    const cta = mapCta(rows[0]);

    // Map kind -> event name
    const eventByKind: Record<string, string> = {
      whatsapp: "cta_whatsapp_click",
      phone: "cta_call_click",
      booking: "cta_booking_click",
      directions: "cta_maps_click",
      google_review: "review_link_clicked",
      form: "lead_submit",
    };
    const eventName = eventByKind[cta.kind] ?? "cta_click";

    // Track event + incrémenter click_count en best-effort
    await Promise.all([
      trackSimpleEvent(cta.businessId, eventName, {
        siteId: cta.siteId,
        ctaId: cta.id,
        anonymousId: body?.anonymousId ?? null,
        sessionId: body?.sessionId ?? null,
        referrer: body?.referrer ?? null,
        path: body?.path ?? null,
      }),
      db.from(TABLES.ctas).update({ click_count: cta.clickCount + 1 }).eq("id", id),
    ]);

    return NextResponse.json({ data: { tracked: true, ctaId: cta.id } });
  } catch (err) {
    return handleApiError(err);
  }
}
