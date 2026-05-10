import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapBusiness } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership } from "@/server/services/ownership";
import { validateBusinessUpdate } from "@/server/validators";

export const runtime = "nodejs";

interface Ctx { params: Promise<{ id: string }>; }

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    const business = await assertBusinessOwnership(viewer.id, id);
    return NextResponse.json({ data: business });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const viewer = await requireUser();
    const { id } = await params;
    await assertBusinessOwnership(viewer.id, id);

    const body = await req.json();
    const validation = validateBusinessUpdate(body);
    if (!validation.ok) {
      throw new ApiError("VALIDATION_ERROR", validation.error, 400, { field: validation.field });
    }
    const v = validation.value;

    const update: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      name: "name",
      slug: "slug",
      category: "category",
      tagline: "tagline",
      description: "description",
      logoUrl: "logo_url",
      bannerUrl: "banner_url",
      primaryColor: "primary_color",
      accentColor: "accent_color",
      email: "email",
      phone: "phone",
      whatsappNumber: "whatsapp_number",
      address: "address",
      city: "city",
      postalCode: "postal_code",
      country: "country",
      websiteUrl: "website_url",
      instagramUrl: "instagram_url",
      facebookUrl: "facebook_url",
      tiktokUrl: "tiktok_url",
      googleBusinessUrl: "google_business_url",
      googleReviewUrl: "google_review_url",
      googleMapsUrl: "google_maps_url",
      bookingUrl: "booking_url",
      openingHours: "opening_hours",
    };

    for (const [tsKey, dbKey] of Object.entries(fieldMap)) {
      if ((v as any)[tsKey] !== undefined) update[dbKey] = (v as any)[tsKey];
    }

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    const result = await db
      .from(TABLES.businesses)
      .update(update)
      .eq("id", id)
      .select("*");

    const rows = Array.isArray(result?.data) ? result.data : [];
    if (rows.length === 0) throw new ApiError("UPDATE_FAILED", "Mise à jour impossible.", 500);
    return NextResponse.json({ data: mapBusiness(rows[0]) });
  } catch (err) {
    return handleApiError(err);
  }
}
