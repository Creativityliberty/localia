// =====================================
// Localia — Ownership guards
// =====================================
// Avant chaque mutation, on vérifie que l'utilisateur est bien
// propriétaire de la ressource. C'est en plus de la RLS InsForge,
// pour avoir des messages d'erreur clairs côté UI.
// =====================================

import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { ApiError } from "@/server/http/api-error";
import { mapBusiness, mapSite } from "@/server/db/mappers";
import { slugify } from "@/lib/utils";
import type { Business, Site } from "@/types/business";

/**
 * Charge le business courant de l'utilisateur (le 1er non supprimé).
 * Crée une erreur 404 si introuvable.
 */
export async function getCurrentBusiness(userId: string): Promise<Business> {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.businesses)
    .select("*")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);

  const rows = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
  
  if (rows.length === 0) {
    // AUTO-HEAL: Si aucun commerce n'existe, on en crée un par défaut
    // pour éviter de bloquer l'utilisateur sur le dashboard.
    console.log(`[ownership] No business found for user ${userId}, auto-creating...`);
    
    // On essaye de récupérer l'email du user via auth pour le nom par défaut
    const { data: userData } = await (client as any).auth.getCurrentUser();
    const email = userData?.user?.email || "user@example.com";
    const defaultName = email.split("@")[0] || "Mon Commerce";
    const slug = `${slugify(defaultName)}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: newBusiness, error: createError } = await db.from(TABLES.businesses).insert([
      {
        owner_id: userId,
        name: defaultName,
        slug: slug,
        category: "OTHER",
        email: email,
      }
    ]).select().single();

    if (createError || !newBusiness) {
      console.error("[ownership] Auto-create business failed:", createError);
      throw new ApiError("BUSINESS_NOT_FOUND", "Aucun commerce trouvé et la création automatique a échoué.", 404);
    }

    return mapBusiness(newBusiness);
  }

  return mapBusiness(rows[0]);
}

/**
 * Vérifie que le business appartient bien au user, sinon 403.
 */
export async function assertBusinessOwnership(
  userId: string,
  businessId: string,
): Promise<Business> {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.businesses)
    .select("*")
    .eq("id", businessId)
    .is("deleted_at", null)
    .limit(1);

  const rows = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
  if (rows.length === 0) {
    throw new ApiError("BUSINESS_NOT_FOUND", "Commerce introuvable.", 404);
  }

  const business = mapBusiness(rows[0]);
  if (business.ownerId !== userId) {
    throw new ApiError("FORBIDDEN", "Accès refusé à ce commerce.", 403);
  }

  return business;
}

/**
 * Vérifie qu'un site appartient bien à un business du user.
 */
export async function assertSiteOwnership(
  userId: string,
  siteId: string,
): Promise<{ site: Site; business: Business }> {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;

  const result = await db
    .from(TABLES.sites)
    .select("*")
    .eq("id", siteId)
    .is("deleted_at", null)
    .limit(1);

  const rows = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
  if (rows.length === 0) {
    throw new ApiError("SITE_NOT_FOUND", "Site introuvable.", 404);
  }

  const site = mapSite(rows[0]);
  const business = await assertBusinessOwnership(userId, site.businessId);

  return { site, business };
}
