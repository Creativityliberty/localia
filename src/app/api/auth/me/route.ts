import { NextResponse } from "next/server";
import { getViewer } from "@/server/auth/get-viewer";
import { handleApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await getViewer();
    return NextResponse.json({ data: viewer });
  } catch (err) {
    return handleApiError(err);
  }
}
