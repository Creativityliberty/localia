import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSection } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";
import { validateSectionInput } from "@/server/validators";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const viewer = await requireUser();
    const url = new URL(req.url);
    const siteId = url.searchParams.get("siteId");
    if (!siteId) throw new ApiError("MISSING_SITE_ID", "Paramètre siteId requis.", 400);

    await assertSiteOwnership(viewer.id, siteId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.sections)
      .select("*")
      .eq("site_id", siteId)
      .order("position", { ascending: true });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapSection) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const validation = validateSectionInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;

    const { site, business } = await assertSiteOwnership(viewer.id, v.siteId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.sections)
      .insert({
        site_id: site.id,
        business_id: business.id,
        kind: v.kind,
        title: v.title,
        subtitle: v.subtitle,
        body: v.body,
        content: v.content ?? {},
        position: v.position ?? 0,
        is_visible: v.isVisible ?? true,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création impossible.", 500);
    return NextResponse.json({ data: mapSection(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
