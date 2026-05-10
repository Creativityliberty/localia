// =====================================
// Localia — Dashboard stats service
// =====================================
// Calcule les KPI affichés sur le dashboard :
// vues, clics WhatsApp, leads, fidélité, etc.
// =====================================

import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import type { DashboardStats } from "@/types/api";

export async function computeDashboardStats(businessId: string): Promise<DashboardStats> {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Hélper local pour count avec filtres flexibles selon SDK InsForge
  async function countEvents(name: string, after: string, before?: string): Promise<number> {
    let q = db
      .from(TABLES.events)
      .select("id")
      .eq("business_id", businessId)
      .eq("name", name)
      .gte("created_at", after);
    if (before) q = q.lt("created_at", before);
    const r = await q;
    const rows = Array.isArray(r?.data) ? r.data : [];
    return rows.length;
  }

  async function countLeads(after?: string): Promise<number> {
    let q = db
      .from(TABLES.leads)
      .select("id")
      .eq("business_id", businessId)
      .is("deleted_at", null);
    if (after) q = q.gte("created_at", after);
    const r = await q;
    const rows = Array.isArray(r?.data) ? r.data : [];
    return rows.length;
  }

  // Run en parallèle
  const [
    views30d, viewsPrev30d,
    whatsappClicks30d, whatsappClicksPrev30d,
    leadsTotal, leads7d,
    customersR, rewardsR,
  ] = await Promise.all([
    countEvents("page_view", d30),
    countEvents("page_view", d60, d30),
    countEvents("cta_whatsapp_click", d30),
    countEvents("cta_whatsapp_click", d60, d30),
    countLeads(),
    countLeads(d7),
    db.from(TABLES.customers).select("id").eq("business_id", businessId).is("deleted_at", null),
    db.from(TABLES.rewards).select("id").eq("business_id", businessId).eq("status", "AVAILABLE"),
  ]);

  const customerRows = Array.isArray(customersR?.data) ? customersR.data : [];
  const rewardRows = Array.isArray(rewardsR?.data) ? rewardsR.data : [];

  const safePct = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  return {
    views30d,
    viewsDelta: safePct(views30d, viewsPrev30d),
    whatsappClicks: whatsappClicks30d,
    whatsappDelta: safePct(whatsappClicks30d, whatsappClicksPrev30d),
    leadsCount: leadsTotal,
    leadsThisWeek: leads7d,
    loyaltyCustomers: customerRows.length,
    rewardsAvailable: rewardRows.length,
  };
}
