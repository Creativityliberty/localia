import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServerClient } from "@/lib/insforge";
import { setAuthCookies } from "@/lib/auth-cookies";
import { ROUTES } from "@/config/routes";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("insforge_code") || searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.dashboard;

  if (code) {
    try {
      const client = createInsforgeServerClient();
      const auth: any = (client as any).auth ?? client;

      // Récupération du verifier PKCE si présent (pour Google/OAuth)
      const codeVerifier = req.cookies.get("localia_pkce_verifier")?.value;
      
      console.log("[auth-callback] Attempting exchange:", { 
        hasCode: !!code, 
        hasVerifier: !!codeVerifier,
        code: code?.substring(0, 10) + "..."
      });

      // Échange du code contre une session
      const resp = await (auth.exchangeOAuthCode?.(code, codeVerifier) || auth.exchangeCodeForSession?.(code));

      console.log("[auth-callback] Response:", JSON.stringify(resp, null, 2));


      if (resp?.error) {
        console.error("Auth callback error:", resp.error);
        return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_failed`);
      }

      const session = resp?.data?.session ?? resp?.session ?? resp?.data;
      const accessToken = session?.accessToken ?? session?.access_token;
      const refreshToken = session?.refreshToken ?? session?.refresh_token;

      if (accessToken) {
        await setAuthCookies({ accessToken, refreshToken });

        
        // Suppression du verifier PKCE et redirection
        const res = NextResponse.redirect(`${origin}${next}`);
        res.cookies.delete("localia_pkce_verifier");
        return res;
      }

    } catch (err) {
      console.error("Auth callback exception:", err);
    }
  }

  // En cas d'erreur ou d'absence de code
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=invalid_auth_code`);
}
