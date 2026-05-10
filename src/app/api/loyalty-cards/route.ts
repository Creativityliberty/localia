import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLoyaltyCard } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership, getCurrentBusiness } from "@/server/services/ownership";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.loyaltyCards)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapLoyaltyCard) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const businessId = String(body?.businessId ?? "").trim();
    if (!businessId) throw new ApiError("MISSING_BUSINESS", "Commerce requis.", 400);
    await assertBusinessOwnership(viewer.id, businessId);

    const kind = body?.kind === "POINTS" ? "POINTS" : "STAMP";
    const name = String(body?.name ?? "").trim().slice(0, 160);
    const rewardLabel = String(body?.rewardLabel ?? "").trim().slice(0, 180);

    if (!name) throw new ApiError("MISSING_NAME", "Nom du programme requis.", 400);
    if (!rewardLabel) throw new ApiError("MISSING_REWARD", "Récompense requise.", 400);

    const stampsRequired =
      kind === "STAMP"
        ? Math.max(2, Math.min(50, Number(body?.stampsRequired ?? 10)))
        : null;
    const rewardThresholdPoints =
      kind === "POINTS"
        ? Math.max(10, Math.min(10000, Number(body?.rewardThresholdPoints ?? 100)))
        : null;
    const pointsPerVisit =
      kind === "POINTS"
        ? Math.max(1, Math.min(100, Number(body?.pointsPerVisit ?? 1)))
        : null;

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.loyaltyCards)
      .insert({
        business_id: businessId,
        name,
        description: body?.description ?? null,
        kind,
        stamps_required: stampsRequired,
        points_per_visit: pointsPerVisit,
        reward_threshold_points: rewardThresholdPoints,
        reward_label: rewardLabel,
        reward_description: body?.rewardDescription ?? null,
        card_color: body?.cardColor ?? "#1B3D0A",
        card_accent: body?.cardAccent ?? "#A6FF4D",
        icon: body?.icon ?? "gift",
        is_active: true,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création impossible.", 500);
    return NextResponse.json({ data: mapLoyaltyCard(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
