import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCta } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";
import { validateCtaInput } from "@/server/validators";

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
      .from(TABLES.ctas)
      .select("*")
      .eq("site_id", siteId)
      .order("position", { ascending: true });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapCta) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const validation = validateCtaInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;

    const { site, business } = await assertSiteOwnership(viewer.id, v.siteId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    // Si c'est un CTA primaire, démarquer les autres en primaire
    if (v.isPrimary) {
      await db.from(TABLES.ctas).update({ is_primary: false }).eq("site_id", site.id);
    }

    const result = await db
      .from(TABLES.ctas)
      .insert({
        site_id: site.id,
        business_id: business.id,
        section_id: v.sectionId,
        label: v.label,
        kind: v.kind,
        value: v.value,
        prefilled_message: v.prefilledMessage,
        position: v.position ?? 0,
        is_primary: v.isPrimary ?? false,
        is_visible: v.isVisible ?? true,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création impossible.", 500);
    return NextResponse.json({ data: mapCta(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
