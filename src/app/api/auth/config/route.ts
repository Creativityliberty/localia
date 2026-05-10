import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      verifyEmailMethod: "code", // On force le mode code pour Localia
      allowGoogleAuth: true,
    }
  });
}
