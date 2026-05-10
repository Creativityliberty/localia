import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSite } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { getCurrentBusiness } from "@/server/services/ownership";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.sites)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapSite) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const body = await req.json();
    const title = String(body?.title ?? business.name).trim() || business.name;

    // Slug auto à partir du nom du business
    const baseSlug = slugify(business.slug || business.name);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.sites)
      .insert({
        business_id: business.id,
        title,
        slug,
        status: "draft",
        hero_title: title,
      })
      .select("*")
      .single?.() ?? db.from(TABLES.sites).insert({
        business_id: business.id,
        title,
        slug,
        status: "draft",
        hero_title: title,
      });

    const row = result?.data?.[0] ?? result?.data;
    if (!row) throw new ApiError("CREATE_FAILED", "Création du site impossible.", 500);

    return NextResponse.json({ data: mapSite(row) });
  } catch (err) {
    return handleApiError(err);
  }
}
