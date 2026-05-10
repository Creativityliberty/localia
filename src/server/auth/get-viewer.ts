import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { ApiError } from "@/server/http/api-error";

export interface AuthViewer {
  id: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

/**
 * Récupère le viewer courant à partir du token d'access en cookie.
 * Retourne un viewer non-authentifié si pas de token ou token invalide.
 */
export async function getViewer(): Promise<AuthViewer> {
  const token = await getAccessToken();

  if (!token) {
    return { id: null, email: null, isAuthenticated: false };
  }

  try {
    const client = createInsforgeServerClient({ accessToken: token });
    const { data, error } = await (client as any).auth.getCurrentUser();

    if (error || !data?.user) {
      // Si le token est expiré ou invalide, on pourrait tenter un refresh ici 
      // mais restons simples pour l'instant.
      return { id: null, email: null, isAuthenticated: false };
    }

    return {
      id: data.user.id ?? null,
      email: data.user.email ?? null,
      isAuthenticated: true,
    };
  } catch (err) {
    console.warn("[localia] getViewer failed:", err);
    return { id: null, email: null, isAuthenticated: false };
  }
}

/**
 * Lève une 401 si l'utilisateur n'est pas authentifié.
 */
export async function requireUser(): Promise<AuthViewer & { id: string }> {
  const viewer = await getViewer();

  if (!viewer.isAuthenticated || !viewer.id) {
    throw new ApiError("UNAUTHORIZED", "Authentification requise.", 401);
  }

  return viewer as AuthViewer & { id: string };
}
