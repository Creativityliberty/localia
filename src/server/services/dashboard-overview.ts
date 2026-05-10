// =====================================
// Localia — Dashboard overview service
// =====================================

import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLead, mapSite } from "@/server/db/mappers";
import type { Lead, Site } from "@/types/business";
import { computeDashboardStats } from "@/server/services/dashboard-stats";
import { getCurrentBusiness } from "@/server/services/ownership";
import type { DashboardStats } from "@/types/api";
import type { Business } from "@/types/business";

export interface DashboardOverview {
  business: Business;
  site: Site | null;
  stats: DashboardStats;
  recentLeads: Lead[];
}

export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const business = await getCurrentBusiness(userId);
  const stats = await computeDashboardStats(business.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  // Site courant
  const siteR = await db
    .from(TABLES.sites)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  const siteRows = Array.isArray(siteR?.data) ? siteR.data : [];
  const site = siteRows.length > 0 ? mapSite(siteRows[0]) : null;

  // 5 leads les plus récents
  const leadsR = await db
    .from(TABLES.leads)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);
  const recentLeads = (Array.isArray(leadsR?.data) ? leadsR.data : []).map(mapLead);

  return { business, site, stats, recentLeads };
}
