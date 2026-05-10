import { NextResponse } from "next/server";
import { getViewer } from "@/server/auth/get-viewer";
import { handleApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await getViewer().catch(() => null);
    return NextResponse.json({ 
      data: { 
        authenticated: !!viewer,
        user: viewer 
      } 
    });
  } catch (err) {
    console.error("[session] error:", err);
    return NextResponse.json({ data: { authenticated: false } });
  }

}
