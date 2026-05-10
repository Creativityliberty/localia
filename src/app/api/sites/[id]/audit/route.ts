import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCta, mapSection, mapService } from "@/server/db/mappers";
import { handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";
import { auditSite } from "@/server/audit/audit-engine";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

/**
 * GET /api/sites/[id]/audit
 *
 * Pré-vérifie la qualité du site et retourne le scorecard
 * sans modifier le statut. Utilisé par l'éditeur pour afficher
 * en temps réel ce qui manque.
 */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { site, business } = await assertSiteOwnership(viewer.id, id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const [sectionsR, servicesR, ctasR, qrR, offerR] = await Promise.all([
      db.from(TABLES.sections).select("*").eq("site_id", site.id),
      db.from(TABLES.services).select("*").eq("business_id", business.id).is("deleted_at", null),
      db.from(TABLES.ctas).select("*").eq("site_id", site.id),
      db.from(TABLES.qrCodes).select("id").eq("business_id", business.id).eq("is_active", true).limit(1),
      db.from(TABLES.offers).select("id").eq("business_id", business.id).eq("is_active", true).is("deleted_at", null).limit(1),
    ]);

    const sections = (Array.isArray(sectionsR?.data) ? sectionsR.data : []).map(mapSection);
    const services = (Array.isArray(servicesR?.data) ? servicesR.data : []).map(mapService);
    const ctas = (Array.isArray(ctasR?.data) ? ctasR.data : []).map(mapCta);
    const hasQrCode = Array.isArray(qrR?.data) && qrR.data.length > 0;
    const hasOffer = Array.isArray(offerR?.data) && offerR.data.length > 0;

    const audit = auditSite({ business, site, sections, services, ctas, hasOffer, hasQrCode });
    return NextResponse.json({ data: audit });
  } catch (err) {
    return handleApiError(err);
  }
}
