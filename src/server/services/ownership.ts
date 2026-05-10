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
    throw new ApiError("BUSINESS_NOT_FOUND", "Aucun commerce trouvé pour cet utilisateur.", 404);
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
