import { getAccessToken } from "@/lib/auth-cookies";
import {
  createInsforgeServerClient,
  getInsforgePublicClient,
} from "@/lib/insforge";

/**
 * Retourne un client InsForge authentifié pour la requête courante.
 * RLS InsForge applique automatiquement les policies basées sur auth.uid().
 */
export async function getAuthenticatedClient() {
  const accessToken = await getAccessToken();
  return createInsforgeServerClient({
    accessToken: accessToken ?? undefined,
  });
}

/**
 * Retourne un client public (anon).
 * À utiliser pour : lecture de site publié, insert lead, scan QR public.
 */
export function getPublicClient() {
  return getInsforgePublicClient();
}

/**
 * Helper : déballe une donnée single-row.
 */
export function unwrapSingle<T>(data: T[] | T | null | undefined): T | null {
  if (!data) return null;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

/**
 * Helper : assure un tableau.
 */
export function unwrapArray<T>(data: T[] | T | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}
