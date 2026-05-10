// =====================================
// Localia — Service public site
// =====================================
// Charge un site publié + business + sections + services + ctas
// par slug, avec un client anon (RLS public_read).
// =====================================

import { getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import {
  mapBusiness, mapSite, mapSection, mapService,
  mapCta, mapTheme, mapOffer,
} from "@/server/db/mappers";
import type {
  Business, Site, Section, Service, Cta, Theme, Offer,
} from "@/types/business";

export interface PublicSiteData {
  business: Business;
  site: Site;
  theme: Theme | null;
  sections: Section[];
  services: Service[];
  ctas: Cta[];
  offer: Offer | null;
}

export async function getPublicSiteBySlug(
  slug: string,
): Promise<PublicSiteData | null> {
  const client = getPublicClient();
  const db: any = (client as any).database ?? client;

  try {
    // 1. Site
    const siteResult = await db
      .from(TABLES.sites)
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(1);

    const siteRows = Array.isArray(siteResult?.data) ? siteResult.data : siteResult?.data ? [siteResult.data] : [];
    if (siteRows.length === 0) return null;
    const site = mapSite(siteRows[0]);

    // 2. Business
    const bizResult = await db
      .from(TABLES.businesses)
      .select("*")
      .eq("id", site.businessId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(1);
    const bizRows = Array.isArray(bizResult?.data) ? bizResult.data : bizResult?.data ? [bizResult.data] : [];
    if (bizRows.length === 0) return null;
    const business = mapBusiness(bizRows[0]);

    // 3. Theme
    let theme: Theme | null = null;
    if (site.themeId) {
      const themeResult = await db
        .from(TABLES.themes)
        .select("*")
        .eq("id", site.themeId)
        .limit(1);
      const themeRows = Array.isArray(themeResult?.data) ? themeResult.data : themeResult?.data ? [themeResult.data] : [];
      if (themeRows.length > 0) theme = mapTheme(themeRows[0]);
    }

    // 4. Sections
    const sectionsResult = await db
      .from(TABLES.sections)
      .select("*")
      .eq("site_id", site.id)
      .eq("is_visible", true)
      .order("position", { ascending: true });
    const sections = (Array.isArray(sectionsResult?.data) ? sectionsResult.data : []).map(mapSection);

    // 5. Services
    const servicesResult = await db
      .from(TABLES.services)
      .select("*")
      .eq("business_id", business.id)
      .eq("is_visible", true)
      .is("deleted_at", null)
      .order("position", { ascending: true });
    const services = (Array.isArray(servicesResult?.data) ? servicesResult.data : []).map(mapService);

    // 6. CTAs
    const ctasResult = await db
      .from(TABLES.ctas)
      .select("*")
      .eq("site_id", site.id)
      .eq("is_visible", true)
      .order("position", { ascending: true });
    const ctas = (Array.isArray(ctasResult?.data) ? ctasResult.data : []).map(mapCta);

    // 7. Offre active (welcome ou la 1ère active)
    const offerResult = await db
      .from(TABLES.offers)
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(1);
    const offerRows = Array.isArray(offerResult?.data) ? offerResult.data : offerResult?.data ? [offerResult.data] : [];
    const offer = offerRows.length > 0 ? mapOffer(offerRows[0]) : null;

    return { business, site, theme, sections, services, ctas, offer };
  } catch (err) {
    console.error("[localia] getPublicSiteBySlug failed:", err);
    return null;
  }
}
