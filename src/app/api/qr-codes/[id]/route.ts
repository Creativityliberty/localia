import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapQrCode } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

async function loadQrAndAssert(userId: string, id: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.qrCodes).select("*").eq("id", id).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("QR_NOT_FOUND", "QR code introuvable.", 404);

  const qr = mapQrCode(rows[0]);
  await assertBusinessOwnership(userId, qr.businessId);
  return { qr, db };
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadQrAndAssert(viewer.id, id);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.label === "string") update.label = body.label.slice(0, 160);
    if (typeof body.targetUrl === "string") update.target_url = body.targetUrl;
    if (typeof body.isActive === "boolean") update.is_active = body.isActive;

    const result = await db.from(TABLES.qrCodes).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapQrCode(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadQrAndAssert(viewer.id, id);

    await db.from(TABLES.qrCodes).update({ is_active: false }).eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
