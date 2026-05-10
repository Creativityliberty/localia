import { NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { validateEventInput } from "@/server/validators";
import { trackEvent } from "@/server/services/tracking";

export const runtime = "nodejs";

/**
 * POST /api/events
 *
 * Endpoint public utilisé par le tracker côté client pour enregistrer
 * des events analytics : page_view, cta_click, etc.
 *
 * Note : on accepte les events sans auth (RLS events_public_insert).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateEventInput(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }

    await trackEvent(validation.value);

    return NextResponse.json({ data: { tracked: true } });
  } catch (err) {
    return handleApiError(err);
  }
}
