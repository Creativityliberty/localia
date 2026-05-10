import { LeadsList } from "@/components/dashboard/leads-list";
import { PageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

export default function DashboardLeadsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Demandes"
        description="Toutes les demandes reçues via votre formulaire et vos boutons. Marquez-les comme contactées pour suivre votre conversion."
      />
      <LeadsList />
    </div>
  );
}
