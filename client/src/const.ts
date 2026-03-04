import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
export { COOKIE_NAME, ONE_YEAR_MS };
import { Capacitor } from "@capacitor/core";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (): string => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // Guard: if VITE_OAUTH_PORTAL_URL is not configured, fall back gracefully.
  // On native this would have crashed with "TypeError: Failed to construct 'URL': Invalid URL".
  if (!oauthPortalUrl) {
    console.warn("[getLoginUrl] VITE_OAUTH_PORTAL_URL is not set. Falling back to /sign-in.");
    return "/sign-in";
  }

  const baseUrl = Capacitor.isNativePlatform() ? "https://moon-dashboard-one.vercel.app" : window.location.origin;
  const redirectUri = `${baseUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId ?? "");
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
