import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapSection, mapService, mapCta, mapSite } from "@/server/db/mappers";
import { auditSite } from "@/server/audit/audit-engine";
import { SiteBuilder } from "@/components/builder/site-builder";
import { ROUTES } from "@/config/routes";

export const dynamic = "force-dynamic";

export default async function SiteBuilderPage() {
  const viewer = await requireUser();
  const business = await getCurrentBusiness(viewer.id);

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  // Charger ou créer un site
  const siteR = await db
    .from(TABLES.sites)
    .select("*")
    .eq("business_id", business.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  let siteRows = Array.isArray(siteR?.data) ? siteR.data : [];

  if (siteRows.length === 0) {
    // Créer un site brouillon par défaut
    const slug = `${business.slug}-site`;
    const created = await db.from(TABLES.sites).insert({
      business_id: business.id,
      title: business.name,
      slug,
      status: "draft",
      hero_title: business.name,
    }).select("*");
    siteRows = Array.isArray(created?.data) ? created.data : [];
    if (siteRows.length === 0) redirect(ROUTES.dashboard);
  }

  const site = mapSite(siteRows[0]);

  const [sectionsR, servicesR, ctasR] = await Promise.all([
    db.from(TABLES.sections).select("*").eq("site_id", site.id).order("position", { ascending: true }),
    db.from(TABLES.services).select("*").eq("business_id", business.id).is("deleted_at", null).order("position", { ascending: true }),
    db.from(TABLES.ctas).select("*").eq("site_id", site.id).order("position", { ascending: true }),
  ]);

  const sections = (Array.isArray(sectionsR?.data) ? sectionsR.data : []).map(mapSection);
  const services = (Array.isArray(servicesR?.data) ? servicesR.data : []).map(mapService);
  const ctas = (Array.isArray(ctasR?.data) ? ctasR.data : []).map(mapCta);

  const audit = auditSite({
    business, site, sections, services, ctas,
    hasOffer: false, hasQrCode: false,
  });

  return (
    <SiteBuilder
      business={business}
      site={site}
      initialSections={sections}
      initialServices={services}
      initialCtas={ctas}
      initialAudit={audit}
    />
  );
}
