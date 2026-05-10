import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { handleApiError, ApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = body?.password;
    const code = body?.code;
    const type = body?.type || "password";

    if (!email) {
      throw new ApiError("INVALID_EMAIL", "Email requis.", 400);
    }

    const client = createInsforgeServerClient();
    const auth: any = (client as any).auth ?? client;
    let resp: any;

    if (type === "password") {
      if (!password) {
        throw new ApiError("INVALID_CREDENTIALS", "Mot de passe requis.", 400);
      }
      resp = await (
        auth.signInWithPassword?.({ email, password }) ??
        auth.signInWithEmail?.({ email, password }) ??
        auth.signIn?.({ email, password })
      );
    } else {
      if (!code) {
        throw new ApiError("INVALID_CODE", "Code requis.", 400);
      }
      console.log("[login] Attempting code login for:", email);
      // For code login, we use verifyEmail or similar method
      resp = await (auth.verifyEmail?.({ email, otp: code }) || 
             auth.verifyOtp?.({ email, otp: code }));
      
      console.log("[login] Code login response:", JSON.stringify(resp, null, 2));
    }

    if (resp?.error) {
      console.error("[login] Auth error:", resp.error);
      // If error is related to email not verified, we can inform the user
      if (resp.error.statusCode === 403 || resp.error.message?.toLowerCase().includes("verified") || resp.error.message?.toLowerCase().includes("confirmed")) {
         return NextResponse.json({
           error: { 
             code: "EMAIL_NOT_VERIFIED",
             message: "Email non vérifié. Veuillez valider votre compte.",
             requiresVerification: true,
             email
           }
         }, { status: 403 });
      }

      throw new ApiError("LOGIN_FAILED", resp.error.message || "Identifiants incorrects.", 401);
    }

    const session = resp?.data?.session ?? resp?.session ?? resp?.data;
    const accessToken = session?.accessToken ?? session?.access_token ?? resp?.data?.accessToken ?? resp?.data?.access_token;
    const refreshToken = session?.refreshToken ?? session?.refresh_token ?? resp?.data?.refreshToken ?? resp?.data?.refresh_token;

    console.log("[login] Session check:", { hasAccessToken: !!accessToken, sessionKeys: Object.keys(session || {}) });

    if (!accessToken) {
      throw new ApiError("LOGIN_FAILED", "Session non créée.", 401);
    }



    await setAuthCookies({ accessToken, refreshToken });

    return NextResponse.json({
      data: {
        userId: resp?.data?.user?.id ?? resp?.user?.id ?? null,
        email,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

