import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { handleApiError } from "@/server/http/api-error";
import { getCurrentBusiness } from "@/server/services/ownership";
import { computeDashboardStats } from "@/server/services/dashboard-stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);
    const stats = await computeDashboardStats(business.id);
    return NextResponse.json({ data: stats });
  } catch (err) {
    return handleApiError(err);
  }
}
