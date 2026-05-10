import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapQrCode } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership, getCurrentBusiness } from "@/server/services/ownership";
import { validateQrInput } from "@/server/validators";
import { generateToken } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.qrCodes)
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapQrCode) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const validation = validateQrInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;
    await assertBusinessOwnership(viewer.id, v.businessId);

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    // Génération d'un token unique (best-effort, retry si collision)
    let shortToken = generateToken(8);
    for (let attempt = 0; attempt < 3; attempt++) {
      const exists = await db.from(TABLES.qrCodes).select("id").eq("short_token", shortToken).limit(1);
      if (!Array.isArray(exists?.data) || exists.data.length === 0) break;
      shortToken = generateToken(8);
    }

    const result = await db
      .from(TABLES.qrCodes)
      .insert({
        business_id: v.businessId,
        site_id: v.siteId,
        label: v.label,
        purpose: v.purpose,
        short_token: shortToken,
        target_url: v.targetUrl,
        utm_source: v.utmSource ?? "qr",
        utm_medium: "qr",
        utm_campaign: v.utmCampaign,
        is_active: true,
      })
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("CREATE_FAILED", "Création QR impossible.", 500);
    return NextResponse.json({ data: mapQrCode(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
