import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCustomerCard } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";
import { addPoints } from "@/server/services/loyalty";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

export async function POST(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;
    const cardR = await db.from(TABLES.customerCards).select("*").eq("id", id).limit(1);
    const cardRows = Array.isArray(cardR?.data) ? cardR.data : [];
    if (cardRows.length === 0) throw new ApiError("CARD_NOT_FOUND", "Carte introuvable.", 404);
    const card = mapCustomerCard(cardRows[0]);
    await assertBusinessOwnership(viewer.id, card.businessId);

    const body = await req.json().catch(() => ({}));
    const points = Number(body?.points ?? 1);
    const amount = body?.amount !== undefined ? Number(body.amount) : undefined;

    if (!Number.isFinite(points) || points <= 0 || points > 1000) {
      throw new ApiError("INVALID_POINTS", "Points invalides (entre 1 et 1000).", 400);
    }

    const result = await addPoints({
      customerCardId: id,
      points: Math.floor(points),
      amount: Number.isFinite(amount) ? amount : undefined,
      createdBy: viewer.id,
      note: typeof body?.note === "string" ? body.note.slice(0, 500) : undefined,
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    return handleApiError(err);
  }
}
