import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapService } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadServiceAndAssert(userId: string, serviceId: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.services).select("*").eq("id", serviceId).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("SERVICE_NOT_FOUND", "Service introuvable.", 404);

  const service = mapService(rows[0]);
  await assertBusinessOwnership(userId, service.businessId);
  return { service, db };
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadServiceAndAssert(viewer.id, id);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.slice(0, 180);
    if (typeof body.description === "string" || body.description === null) update.description = body.description;
    if (typeof body.priceLabel === "string" || body.priceLabel === null) update.price_label = body.priceLabel;
    if (typeof body.priceAmount === "number" || body.priceAmount === null) update.price_amount = body.priceAmount;
    if (typeof body.imageUrl === "string" || body.imageUrl === null) update.image_url = body.imageUrl;
    if (typeof body.position === "number") update.position = Math.max(0, Math.floor(body.position));
    if (typeof body.isVisible === "boolean") update.is_visible = body.isVisible;
    if (typeof body.isFeatured === "boolean") update.is_featured = body.isFeatured;

    const result = await db.from(TABLES.services).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapService(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadServiceAndAssert(viewer.id, id);

    await db.from(TABLES.services).update({ deleted_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
