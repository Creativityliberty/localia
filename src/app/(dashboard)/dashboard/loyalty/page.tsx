import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLoyaltyCard } from "@/server/db/mappers";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoyaltyManager } from "@/components/dashboard/loyalty-manager";

export const dynamic = "force-dynamic";

export default async function LoyaltyPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.loyaltyCards)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const programs = (Array.isArray(result?.data) ? result.data : []).map(mapLoyaltyCard);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Programme fidélité"
        description="Carte digitale, points ou tampons. Vos clients la consultent depuis leur téléphone via QR code."
      />
      <LoyaltyManager businessId={business.id} initialPrograms={programs} />
    </div>
  );
}
