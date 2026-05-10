// =====================================
// Localia — ApiError pour réponses API homogènes
// =====================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/**
 * Wrapper pour les routes API : convertit les ApiError en réponse HTTP propre.
 */
export function handleApiError(err: unknown): Response {
  if (isApiError(err)) {
    return new Response(JSON.stringify(err.toJSON()), {
      status: err.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.error("[localia] unexpected error:", err);
  const message = err instanceof Error ? err.message : "Erreur interne";

  return new Response(
    JSON.stringify({
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}
