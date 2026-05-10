import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { handleApiError, ApiError } from "@/server/http/api-error";
import { TABLES } from "@/server/db/tables";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    // On accepte 'name' ou 'businessName' car les formulaires varient
    const businessName = String(body?.businessName || body?.name || "").trim();

    if (!email) throw new ApiError("INVALID_EMAIL", "Email requis.", 400);
    if (password.length < 8) throw new ApiError("WEAK_PASSWORD", "8 caractères minimum.", 400);
    if (!businessName) throw new ApiError("MISSING_BUSINESS_NAME", "Nom du commerce requis.", 400);


    const client = createInsforgeServerClient();
    const auth: any = (client as any).auth ?? client;

    const signupResp = await auth.signUp({ email, password });

    console.log("[signup] Response:", JSON.stringify(signupResp, null, 2));

    if (signupResp?.error) {
      throw new ApiError(
        "SIGNUP_FAILED",
        signupResp.error.message ?? "Inscription impossible.",
        400,
      );
    }

    const data = signupResp?.data ?? signupResp;
    const user = data?.user || signupResp?.user; // Try multiple paths
    const session = data?.session || signupResp?.session || data;
    const accessToken = session?.accessToken || session?.access_token;
    const refreshToken = session?.refreshToken || session?.refresh_token;

    console.log("[signup] User check:", { userId: user?.id, hasSession: !!session, hasToken: !!accessToken });


    let createdSlug = "";

    // 2. Créer un business par défaut (même si la vérification est requise, si on a l'ID)
    if (user?.id) {
      const baseSlug = slugify(businessName) || "mon-commerce";
      createdSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      
      // Use a server client (which has service role or admin access usually, or just direct DB access)
      // Since we don't have a session, we use the server client as is
      const db: any = (client as any).database ?? client;

      const { error: insertError } = await db.from(TABLES.businesses).insert([
        {
          owner_id: user.id,
          name: businessName,
          slug: createdSlug,
          category: "OTHER",
          email,
        },
      ]);

      if (insertError) {
        console.error("[signup] business insert error:", insertError);
        // We don't throw yet, maybe the user already exists or something
      } else {
        console.log("[signup] Business created successfully:", createdSlug);
      }
    }

    // Si pas de session, c'est qu'une vérification par email est requise
    if (!session || !accessToken) {
      return NextResponse.json({
        data: {
          requiresVerification: true,
          email,
        },
      });
    }



    // 3. Set cookies
    await setAuthCookies({ accessToken, refreshToken });


    return NextResponse.json({
      data: {
        userId: user.id,
        email,
        businessSlug: createdSlug,
        requiresVerification: false,
      },
    });
  } catch (err: any) {
    console.error("[register] global error:", err);
    return NextResponse.json({
      success: false,
      error: {
        code: "REGISTER_ERROR",
        message: err.message || "Erreur lors de l'inscription."
      }
    }, { status: 500 });
  }

}
