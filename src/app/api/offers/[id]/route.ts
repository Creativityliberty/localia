import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapOffer } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

async function loadOfferAndAssert(userId: string, id: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.offers).select("*").eq("id", id).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("OFFER_NOT_FOUND", "Offre introuvable.", 404);

  const offer = mapOffer(rows[0]);
  await assertBusinessOwnership(userId, offer.businessId);
  return { offer, db };
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadOfferAndAssert(viewer.id, id);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.slice(0, 180);
    if (typeof body.description === "string" || body.description === null) update.description = body.description;
    if (typeof body.promoCode === "string" || body.promoCode === null) update.promo_code = body.promoCode;
    if (typeof body.rewardLabel === "string" || body.rewardLabel === null) update.reward_label = body.rewardLabel;
    if (typeof body.conditions === "string" || body.conditions === null) update.conditions = body.conditions;
    if (typeof body.isActive === "boolean") update.is_active = body.isActive;
    if (typeof body.isWelcome === "boolean") update.is_welcome = body.isWelcome;

    const result = await db.from(TABLES.offers).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapOffer(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadOfferAndAssert(viewer.id, id);

    await db.from(TABLES.offers).update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
