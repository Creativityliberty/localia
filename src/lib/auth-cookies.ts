import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "localia_access_token";
const REFRESH_TOKEN_COOKIE = "localia_refresh_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function setAuthCookies(opts: {
  accessToken: string;
  refreshToken?: string;
  maxAgeSeconds?: number;
}) {
  const cookieStore = await cookies();
  const maxAge = opts.maxAgeSeconds ?? 60 * 60 * 24 * 7; // 7 jours

  cookieStore.set(ACCESS_TOKEN_COOKIE, opts.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge,
  });

  if (opts.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, opts.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
