import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLead } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";
import { validateLeadStatusUpdate } from "@/server/validators";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadLeadAndAssert(userId: string, leadId: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.leads).select("*").eq("id", leadId).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("LEAD_NOT_FOUND", "Demande introuvable.", 404);

  const lead = mapLead(rows[0]);
  await assertBusinessOwnership(userId, lead.businessId);
  return { lead, db };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { lead } = await loadLeadAndAssert(viewer.id, id);

    // Auto-marquer comme lu
    if (lead.status === "new") {
      const client = await getAuthenticatedClient();
      const db: any = (client as any).database ?? client;
      await db.from(TABLES.leads).update({ status: "read" }).eq("id", id);
      lead.status = "read";
    }

    return NextResponse.json({ data: lead });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadLeadAndAssert(viewer.id, id);

    const body = await req.json();
    const validation = validateLeadStatusUpdate(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;

    const update: Record<string, unknown> = {
      status: v.status,
      internal_notes: v.internalNotes,
    };
    if (v.status === "contacted") update.contacted_at = new Date().toISOString();
    if (v.status === "converted") update.converted_at = new Date().toISOString();

    const result = await db.from(TABLES.leads).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapLead(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadLeadAndAssert(viewer.id, id);

    await db
      .from(TABLES.leads)
      .update({ deleted_at: new Date().toISOString(), status: "archived" })
      .eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
