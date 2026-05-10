import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapService } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership, getCurrentBusiness } from "@/server/services/ownership";
import { validateServiceInput } from "@/server/validators";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const viewer = await requireUser();
    const url = new URL(req.url);
    const businessId = url.searchParams.get("businessId");

    const business = businessId
      ? await assertBusinessOwnership(viewer.id, businessId)
      : await getCurrentBusiness(viewer.id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.services)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("position", { ascending: true });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapService) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const validation = validateServiceInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;
    await assertBusinessOwnership(viewer.id, v.businessId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.services)
      .insert({
        business_id: v.businessId,
        site_id: v.siteId,
        title: v.title,
        description: v.description,
        price_label: v.priceLabel,
        price_amount: v.priceAmount,
        duration_minutes: v.durationMinutes,
        image_url: v.imageUrl,
        badge: v.badge,
        position: v.position ?? 0,
        is_featured: v.isFeatured ?? false,
        is_visible: v.isVisible ?? true,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création impossible.", 500);
    return NextResponse.json({ data: mapService(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
