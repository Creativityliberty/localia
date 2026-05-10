import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { getCurrentBusiness } from "@/server/services/ownership";
import { generateSiteContent } from "@/server/services/ai-generator";
import type { AiSiteGenerationInput } from "@/types/api";
import type { BusinessCategory } from "@/types/business";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ai/generate-site
 *
 * Body : { description?, services?, tone? }
 * On utilise toujours le business courant pour name + category + location.
 */
export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const body = await req.json().catch(() => ({}));

    const input: AiSiteGenerationInput = {
      businessName: business.name,
      category: business.category,
      location: business.city ?? undefined,
      description: typeof body?.description === "string" ? body.description.slice(0, 1500) : undefined,
      services: Array.isArray(body?.services)
        ? body.services.filter((s: unknown) => typeof s === "string").slice(0, 12)
        : undefined,
      tone: ["warm", "professional", "playful", "minimal"].includes(body?.tone) ? body.tone : undefined,
    };

    if (!input.businessName || !input.category) {
      throw new ApiError("MISSING_BUSINESS", "Nom et catégorie de commerce requis.", 400);
    }

    const generated = await generateSiteContent({
      ...input,
      category: input.category as BusinessCategory,
    });

    return NextResponse.json({ data: generated });
  } catch (err) {
    return handleApiError(err);
  }
}
