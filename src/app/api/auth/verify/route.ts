import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServerClient } from "@/lib/insforge";
import { setAuthCookies } from "@/lib/auth-cookies";
import { handleApiError, ApiError } from "@/server/http/api-error";
import { TABLES } from "@/server/db/tables";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, businessName } = body;

    if (!email || !otp) {
      throw new ApiError("MISSING_PARAMS", "Email et code requis.", 400);
    }

    const client = createInsforgeServerClient();
    const auth: any = (client as any).auth ?? client;

    // 1. Vérifier l'email
    const verifyResp = await auth.verifyEmail({ email, otp });

    if (verifyResp?.error) {
      throw new ApiError("VERIFICATION_FAILED", verifyResp.error.message || "Code invalide.", 400);
    }

    const data = verifyResp?.data ?? verifyResp;
    const session = data?.session || data;
    const user = data?.user || verifyResp?.user;
    
    const accessToken = session?.accessToken || session?.access_token;
    const refreshToken = session?.refreshToken || session?.refresh_token;

    if (!accessToken) {
      throw new ApiError("VERIFICATION_FAILED", "Session non créée après vérification.", 500);
    }

    // 2. Créer le commerce s'il n'existe pas (et si on a le nom)
    if (user?.id && businessName) {
      const db = (client as any).database || client;

      // On vérifie si un commerce existe déjà pour cet utilisateur
      const { data: existing } = await db.from(TABLES.businesses)
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!existing) {
        const baseSlug = slugify(businessName) || "mon-commerce";
        const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        
        await db.from(TABLES.businesses).insert([
          {
            owner_id: user.id,
            name: businessName,
            slug,
            category: "OTHER",
            email,
          },
        ]);

        console.log("[verify] Business created for user:", user.id);
      }
    }

    // 3. Set cookies
    await setAuthCookies({ accessToken, refreshToken });

    return NextResponse.json({
      success: true,
      data: {
        userId: user?.id,
        email,
      }
    });

  } catch (err) {
    return handleApiError(err);
  }
}
