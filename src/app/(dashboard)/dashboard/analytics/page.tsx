import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { computeDashboardStats } from "@/server/services/dashboard-stats";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Eye, MessageCircle, Phone, Inbox, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);
  const stats = await computeDashboardStats(business.id);

  // Stats supplémentaires : QR scans, calls
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  async function countEvent(name: string) {
    const r = await db.from(TABLES.events).select("id")
      .eq("business_id", business.id).eq("name", name).gte("created_at", d30);
    return Array.isArray(r?.data) ? r.data.length : 0;
  }

  const [qrScans, callClicks] = await Promise.all([
    countEvent("qr_scan"),
    countEvent("cta_call_click"),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Sur 30 jours. Sans Google Analytics, sans cookies, juste l'essentiel pour comprendre votre traction."
      />

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vues" value={stats.views30d} delta={stats.viewsDelta} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Clics WhatsApp" value={stats.whatsappClicks} delta={stats.whatsappDelta} icon={<MessageCircle className="h-4 w-4" />} />
        <StatCard label="Clics appel" value={callClicks} icon={<Phone className="h-4 w-4" />} />
        <StatCard label="Demandes" value={stats.leadsCount} icon={<Inbox className="h-4 w-4" />} />
        <StatCard label="Scans QR" value={qrScans} icon={<QrCode className="h-4 w-4" />} />
        <StatCard label="Clients fidèles" value={stats.loyaltyCustomers} variant="accent" />
      </section>

      <Card>
        <div className="px-6 py-5">
          <h2 className="font-display text-lg text-ink-900 mb-2">Comprendre ces chiffres</h2>
          <ul className="space-y-2 text-sm text-ink-500 leading-relaxed">
            <li><strong className="text-ink-900">Vues</strong> — combien de fois votre mini-site a été ouvert.</li>
            <li><strong className="text-ink-900">Clics WhatsApp</strong> — visiteurs qui vous ont écrit. Le meilleur indicateur d'intérêt.</li>
            <li><strong className="text-ink-900">Demandes</strong> — formulaires remplis. Conversion la plus engagée.</li>
            <li><strong className="text-ink-900">Scans QR</strong> — visiteurs qui ont scanné un de vos QR codes.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
