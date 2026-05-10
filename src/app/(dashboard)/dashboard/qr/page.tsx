import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapQrCode, mapSite } from "@/server/db/mappers";
import { PageHeader } from "@/components/dashboard/page-header";
import { QrCodesManager } from "@/components/dashboard/qr-codes-manager";

export const dynamic = "force-dynamic";

export default async function QrCodesPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const [qrR, siteR] = await Promise.all([
    db.from(TABLES.qrCodes).select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    db.from(TABLES.sites).select("*").eq("business_id", business.id).is("deleted_at", null).limit(1),
  ]);

  const qrCodes = (Array.isArray(qrR?.data) ? qrR.data : []).map(mapQrCode);
  const siteRows = Array.isArray(siteR?.data) ? siteR.data : [];
  const site = siteRows.length > 0 ? mapSite(siteRows[0]) : null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="QR codes"
        description="Imprimez ces QR codes sur votre vitrine, vos cartes, vos flyers. Chaque scan est traçable."
      />
      <QrCodesManager
        businessId={business.id}
        siteSlug={site?.slug ?? null}
        siteId={site?.id ?? null}
        whatsappNumber={business.whatsappNumber}
        googleReviewUrl={business.googleReviewUrl}
        bookingUrl={business.bookingUrl}
        initialQrCodes={qrCodes}
      />
    </div>
  );
}
