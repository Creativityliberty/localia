import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapOffer } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership, getCurrentBusiness } from "@/server/services/ownership";
import { validateOfferInput } from "@/server/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.offers)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapOffer) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const validation = validateOfferInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;
    await assertBusinessOwnership(viewer.id, v.businessId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    // Si c'est l'offre de bienvenue, démarquer les autres
    if (v.isWelcome) {
      await db.from(TABLES.offers).update({ is_welcome: false }).eq("business_id", v.businessId);
    }

    const result = await db
      .from(TABLES.offers)
      .insert({
        business_id: v.businessId,
        site_id: v.siteId,
        title: v.title,
        description: v.description,
        promo_code: v.promoCode,
        reward_label: v.rewardLabel,
        conditions: v.conditions,
        is_welcome: v.isWelcome ?? false,
        is_active: v.isActive ?? true,
        starts_at: v.startsAt,
        ends_at: v.endsAt,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création impossible.", 500);
    return NextResponse.json({ data: mapOffer(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
