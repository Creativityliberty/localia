import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSection } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadSectionAndAssert(userId: string, sectionId: string) {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db.from(TABLES.sections).select("*").eq("id", sectionId).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) throw new ApiError("SECTION_NOT_FOUND", "Section introuvable.", 404);

  const section = mapSection(rows[0]);
  await assertSiteOwnership(userId, section.siteId);
  return { section, db };
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadSectionAndAssert(viewer.id, id);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string" || body.title === null) update.title = body.title;
    if (typeof body.subtitle === "string" || body.subtitle === null) update.subtitle = body.subtitle;
    if (typeof body.body === "string" || body.body === null) update.body = body.body;
    if (body.content && typeof body.content === "object") update.content = body.content;
    if (typeof body.position === "number") update.position = Math.max(0, Math.floor(body.position));
    if (typeof body.isVisible === "boolean") update.is_visible = body.isVisible;

    const result = await db.from(TABLES.sections).update(update).eq("id", id).select("*");
    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapSection(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { db } = await loadSectionAndAssert(viewer.id, id);

    await db.from(TABLES.sections).delete().eq("id", id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
