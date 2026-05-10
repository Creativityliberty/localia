import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: "No access token provided" }, { status: 400 });
    }

    await setAuthCookies({ accessToken, refreshToken });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
  }
}
