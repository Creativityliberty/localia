import { redirect } from "next/navigation";
import { getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapQrCode } from "@/server/db/mappers";
import { trackSimpleEvent } from "@/server/services/tracking";

interface Params {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function QrRedirectPage({ params }: Params) {
  const { token } = await params;

  const client = getPublicClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.qrCodes)
    .select("*")
    .eq("short_token", token)
    .eq("is_active", true)
    .limit(1);

  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) {
    redirect("/");
  }

  const qr = mapQrCode(rows[0]);

  // Track + incrément en best-effort, sans bloquer la redirection
  Promise.all([
    trackSimpleEvent(qr.businessId, "qr_scan", {
      siteId: qr.siteId,
      qrCodeId: qr.id,
      utmSource: qr.utmSource,
      utmMedium: qr.utmMedium,
      utmCampaign: qr.utmCampaign,
      properties: { purpose: qr.purpose },
    }),
    db
      .from(TABLES.qrCodes)
      .update({ scan_count: qr.scanCount + 1, last_scanned_at: new Date().toISOString() })
      .eq("id", qr.id),
  ]).catch((err) => {
    console.warn("[localia] qr scan tracking failed:", err);
  });

  // Construire l'URL finale avec UTM
  let target = qr.targetUrl;
  try {
    const url = new URL(target);
    if (qr.utmSource) url.searchParams.set("utm_source", qr.utmSource);
    if (qr.utmMedium) url.searchParams.set("utm_medium", qr.utmMedium);
    if (qr.utmCampaign) url.searchParams.set("utm_campaign", qr.utmCampaign);
    target = url.toString();
  } catch {
    // URL invalide : on redirige quand même tel quel
  }

  redirect(target);
}
