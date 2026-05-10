import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSection, mapService, mapCta, mapSite, mapOffer } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";
import { auditSite } from "@/server/audit/audit-engine";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/sites/[id]/publish
 *
 * Lance l'audit + publie si toutes les blocking gates passent.
 * Si force=true et qu'il y a des warnings (mais pas de blockers),
 * on publie quand même.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { site, business } = await assertSiteOwnership(viewer.id, id);

    const body = await req.json().catch(() => ({}));
    const force = Boolean(body?.force);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    // Charger sections, services, ctas, offer pour l'audit
    const [sectionsR, servicesR, ctasR, qrR, offerR] = await Promise.all([
      db.from(TABLES.sections).select("*").eq("site_id", site.id),
      db.from(TABLES.services).select("*").eq("business_id", business.id).is("deleted_at", null),
      db.from(TABLES.ctas).select("*").eq("site_id", site.id),
      db.from(TABLES.qrCodes).select("id").eq("business_id", business.id).eq("is_active", true).limit(1),
      db.from(TABLES.offers).select("*").eq("business_id", business.id).eq("is_active", true).is("deleted_at", null).limit(1),
    ]);

    const sections = (Array.isArray(sectionsR?.data) ? sectionsR.data : []).map(mapSection);
    const services = (Array.isArray(servicesR?.data) ? servicesR.data : []).map(mapService);
    const ctas = (Array.isArray(ctasR?.data) ? ctasR.data : []).map(mapCta);
    const hasQrCode = Array.isArray(qrR?.data) && qrR.data.length > 0;
    const offerRows = Array.isArray(offerR?.data) ? offerR.data : [];
    const hasOffer = offerRows.length > 0;

    // Audit
    const audit = auditSite({
      business,
      site,
      sections,
      services,
      ctas,
      hasOffer,
      hasQrCode,
    });

    // Bloquer si blockers présents OU score < 70 sans force
    if (audit.blockers.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "PUBLISH_BLOCKED",
            message: "La publication est bloquée par des éléments manquants.",
            details: { audit },
          },
        },
        { status: 422 },
      );
    }

    if (!force && audit.scorecard.total < 70) {
      return NextResponse.json(
        {
          error: {
            code: "PUBLISH_SCORE_TOO_LOW",
            message: "Le score est trop faible pour publier sans confirmation.",
            details: { audit },
          },
        },
        { status: 422 },
      );
    }

    // Publier
    const publishedAt = new Date().toISOString();
    const updateResult = await db
      .from(TABLES.sites)
      .update({ status: "published", published_at: publishedAt })
      .eq("id", site.id)
      .select("*");

    const updatedRows = Array.isArray(updateResult?.data) ? updateResult.data : [];
    if (updatedRows.length === 0) {
      throw new ApiError("PUBLISH_FAILED", "Publication impossible.", 500);
    }

    return NextResponse.json({
      data: {
        site: mapSite(updatedRows[0]),
        audit,
        publicUrl: `/s/${site.slug}`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
