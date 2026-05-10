import { NextResponse } from "next/server";
import { getPublicSiteBySlug } from "@/server/services/public-site";
import { handleApiError } from "@/server/http/api-error";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/public/sites/[slug]
 *
 * Endpoint public utilisé par le formulaire lead et le tracker JS
 * pour récupérer le businessId associé à un slug.
 */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { slug } = await params;
    const data = await getPublicSiteBySlug(slug);

    if (!data) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        businessId: data.business.id,
        siteId: data.site.id,
        businessName: data.business.name,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
