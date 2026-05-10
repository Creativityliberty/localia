import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServerClient } from "@/lib/insforge";
import { handleApiError, ApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      throw new ApiError("MISSING_EMAIL", "Email requis.", 400);
    }

    const client = createInsforgeServerClient();
    const auth: any = (client as any).auth ?? client;

    // SDK call for resend
    const { error } = await (auth.resendVerificationEmail?.({ email }) || Promise.resolve({ error: null }));

    if (error) {
      throw new ApiError("RESEND_FAILED", error.message || "Erreur lors du renvoi.", 400);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return handleApiError(err);
  }
}
