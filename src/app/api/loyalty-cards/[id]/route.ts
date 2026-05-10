import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLoyaltyCard } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

async function loadProgramAndAssert(userId: string, id: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.loyaltyCards).select("*").eq("id", id).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("PROGRAM_NOT_FOUND", "Programme introuvable.", 404);

  const program = mapLoyaltyCard(rows[0]);
  await assertBusinessOwnership(userId, program.businessId);
  return { program, db };
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadProgramAndAssert(viewer.id, id);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.name === "string") update.name = body.name.slice(0, 160);
    if (typeof body.description === "string" || body.description === null) update.description = body.description;
    if (typeof body.rewardLabel === "string") update.reward_label = body.rewardLabel.slice(0, 180);
    if (typeof body.rewardDescription === "string" || body.rewardDescription === null) update.reward_description = body.rewardDescription;
    if (typeof body.cardColor === "string") update.card_color = body.cardColor;
    if (typeof body.cardAccent === "string") update.card_accent = body.cardAccent;
    if (typeof body.icon === "string") update.icon = body.icon.slice(0, 40);
    if (typeof body.isActive === "boolean") update.is_active = body.isActive;
    if (typeof body.stampsRequired === "number") update.stamps_required = Math.max(2, Math.min(50, Math.floor(body.stampsRequired)));
    if (typeof body.rewardThresholdPoints === "number") update.reward_threshold_points = Math.max(10, Math.min(10000, Math.floor(body.rewardThresholdPoints)));
    if (typeof body.pointsPerVisit === "number") update.points_per_visit = Math.max(1, Math.min(100, Math.floor(body.pointsPerVisit)));

    const result = await db.from(TABLES.loyaltyCards).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapLoyaltyCard(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadProgramAndAssert(viewer.id, id);

    await db.from(TABLES.loyaltyCards).update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    }).eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
