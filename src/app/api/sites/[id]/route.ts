import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSite } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertSiteOwnership } from "@/server/services/ownership";
import { validateSiteUpdate } from "@/server/validators";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const { site } = await assertSiteOwnership(viewer.id, id);
    return NextResponse.json({ data: site });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    await assertSiteOwnership(viewer.id, id);

    const body = await req.json();
    const validation = validateSiteUpdate(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const update: Record<string, unknown> = {};
    const v = validation.value;
    if (v.title !== undefined) update.title = v.title;
    if (v.slug !== undefined) update.slug = v.slug;
    if (v.status !== undefined) {
      update.status = v.status;
      if (v.status === "published") update.published_at = new Date().toISOString();
    }
    if (v.themeId !== undefined) update.theme_id = v.themeId;
    if (v.seoTitle !== undefined) update.seo_title = v.seoTitle;
    if (v.seoDescription !== undefined) update.seo_description = v.seoDescription;
    if (v.ogImageUrl !== undefined) update.og_image_url = v.ogImageUrl;
    if (v.heroTitle !== undefined) update.hero_title = v.heroTitle;
    if (v.heroSubtitle !== undefined) update.hero_subtitle = v.heroSubtitle;
    if (v.heroImageUrl !== undefined) update.hero_image_url = v.heroImageUrl;

    const result = await db
      .from(TABLES.sites)
      .update(update)
      .eq("id", id)
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);

    return NextResponse.json({ data: mapSite(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    await assertSiteOwnership(viewer.id, id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    await db
      .from(TABLES.sites)
      .update({ deleted_at: new Date().toISOString(), status: "archived" })
      .eq("id", id);

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
