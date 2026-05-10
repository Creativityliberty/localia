import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

export const dynamic = "force-dynamic";

export default async function BusinessPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader
        title="Mon commerce"
        description="Les informations utilisées partout : sur votre mini-site, vos QR codes, vos relances."
      />
      <BusinessSettingsForm business={business} />
    </div>
  );
}
