import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient, getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLead } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { getCurrentBusiness } from "@/server/services/ownership";
import { validateLeadInput } from "@/server/validators";
import { trackSimpleEvent } from "@/server/services/tracking";

export const runtime = "nodejs";

/**
 * GET /api/leads — owner
 * Liste paginée des leads du business courant, avec filtre status optionnel.
 */
export async function GET(req: Request) {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    let query = db
      .from(TABLES.leads)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const result = await query;
    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapLead) });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/leads — public (anon)
 * Le formulaire client envoie les leads ici. Pas d'auth requise.
 * RLS : leads_public_insert vérifie que le business est actif.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateLeadInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;

    const client = getPublicClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.leads)
      .insert({
        business_id: v.businessId,
        site_id: v.siteId,
        name: v.name,
        email: v.email,
        phone: v.phone,
        message: v.message,
        service_requested: v.serviceRequested,
        source: v.source ?? "site",
        utm_source: v.utmSource,
        utm_medium: v.utmMedium,
        utm_campaign: v.utmCampaign,
        consent_marketing: v.consentMarketing,
        consent_at: v.consentMarketing ? new Date().toISOString() : null,
        status: "new",
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) {
      throw new ApiError("LEAD_INSERT_FAILED", "Impossible d'enregistrer la demande.", 500);
    }

    const lead = mapLead(rows[0]);

    // Track event lead_submit
    await trackSimpleEvent(v.businessId, "lead_submit", {
      siteId: v.siteId,
      utmSource: v.utmSource,
      utmMedium: v.utmMedium,
      utmCampaign: v.utmCampaign,
      properties: { leadId: lead.id, hasEmail: !!v.email, hasPhone: !!v.phone },
    });

    // TODO P1 : envoyer email au commerçant via Brevo
    // TODO P1 : envoyer email auto au client si consent_marketing

    return NextResponse.json({
      data: {
        leadId: lead.id,
        message: "Merci, votre demande a bien été transmise.",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
