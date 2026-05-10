import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapOffer } from "@/server/db/mappers";
import { PageHeader } from "@/components/dashboard/page-header";
import { OffersManager } from "@/components/dashboard/offers-manager";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.offers)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const offers = (Array.isArray(result?.data) ? result.data : []).map(mapOffer);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Offres"
        description="Lancez une offre de bienvenue ou une promotion mensuelle. Visible sur votre mini-site."
      />
      <OffersManager businessId={business.id} initialOffers={offers} />
    </div>
  );
}
