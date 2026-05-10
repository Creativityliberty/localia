import { redirect } from "next/navigation";
import { getViewer } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapBusiness } from "@/server/db/mappers";
import { ROUTES } from "@/config/routes";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer.isAuthenticated || !viewer.id) {
    redirect(ROUTES.login);
  }

  // Récupérer le business courant (le premier non supprimé)
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  let businessName = "Mon commerce";
  let businessSlug = "mon-commerce";

  try {
    const result = await db
      .from(TABLES.businesses)
      .select("*")
      .eq("owner_id", viewer.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1);

    const rows = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
    if (rows.length > 0) {
      const business = mapBusiness(rows[0]);
      businessName = business.name;
      businessSlug = business.slug;
    }
  } catch (err) {
    console.warn("[localia] Could not fetch business in dashboard layout:", err);
  }

  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      <DashboardSidebar businessName={businessName} businessSlug={businessSlug} />

      <div className="flex-1 min-w-0">
        <main className="px-5 py-6 lg:px-10 lg:py-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
