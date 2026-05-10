import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCustomer } from "@/server/db/mappers";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Mail, Phone } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.customers)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const customers = (Array.isArray(result?.data) ? result.data : []).map(mapCustomer);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clients fidèles"
        description="Vos clients enregistrés sur le programme fidélité. Voyez qui revient et qui est dormant."
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Aucun client enregistré"
          description="Créez d'abord un programme fidélité, puis ajoutez vos premiers clients via leur QR code de carte ou directement ici."
          primaryAction={{ label: "Créer un programme fidélité", href: "/dashboard/loyalty" }}
        />
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-cream-300 hover:border-moss-300 transition-colors">
              <div className="h-10 w-10 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center font-display flex-shrink-0">
                {c.firstName.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900">
                  {c.firstName} {c.lastName ?? ""}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400 mt-0.5">
                  {c.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>}
                  {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>}
                  <span>· {c.visitCount} visites</span>
                </div>
              </div>
              <div className="text-xs text-ink-300 flex-shrink-0">
                {c.lastVisitAt ? formatRelativeTime(c.lastVisitAt) : "Jamais venu"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
