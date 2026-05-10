import { createClient } from "@insforge/sdk";

let cachedClient: ReturnType<typeof createClient> | null = null;
let cachedConfig: { baseUrl: string; anonKey: string } | null = null;

function getInsforgeConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error(
      "Missing InsForge configuration. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY."
    );
  }

  return { baseUrl, anonKey };
}

/**
 * Crée un client InsForge serveur, optionnellement authentifié.
 * Utilisé pour des actions ponctuelles (avec token utilisateur).
 */
export function createInsforgeServerClient(options?: { accessToken?: string }) {
  const { baseUrl, anonKey } = getInsforgeConfig();

  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
    ...(options?.accessToken ? { edgeFunctionToken: options.accessToken } : {}),
  });
}

/**
 * Singleton client public InsForge (anon, sans token).
 * Pour les opérations publiques (lecture site publié, insert lead, etc.)
 */
export function getInsforgePublicClient() {
  const config = getInsforgeConfig();

  if (
    !cachedClient ||
    !cachedConfig ||
    cachedConfig.baseUrl !== config.baseUrl ||
    cachedConfig.anonKey !== config.anonKey
  ) {
    cachedClient = createInsforgeServerClient();
    cachedConfig = config;
  }

  return cachedClient;
}

/**
 * Côté serveur Next.js, en présence d'un token de session,
 * on construit un client authentifié spécifique à la requête.
 */
export function getInsforgeServerClient() {
  return getInsforgePublicClient();
}

/**
 * Client InsForge public pour le navigateur.
 * Utilisé pour l'auth OAuth, etc.
 */
export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

/**
 * Vérifie si les variables d'env InsForge sont présentes.
 * Utile pour afficher un warning dev-friendly en l'absence de config.
 */
export const hasInsforgeConfig =
  Boolean(process.env.NEXT_PUBLIC_INSFORGE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY);
