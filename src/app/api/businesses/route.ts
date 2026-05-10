import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapBusiness } from "@/server/db/mappers";
import { handleApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.businesses)
      .select("*")
      .eq("owner_id", viewer.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    const rows = Array.isArray(result?.data) ? result.data : [];
    return NextResponse.json({ data: rows.map(mapBusiness) });
  } catch (err) {
    return handleApiError(err);
  }
}
