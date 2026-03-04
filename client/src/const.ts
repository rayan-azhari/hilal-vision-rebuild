import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
export { COOKIE_NAME, ONE_YEAR_MS };
import { Capacitor } from "@capacitor/core";

/**
 * Returns the URL to send the user to for sign-in.
 * On native (Capacitor/Android/iOS) we cannot use Clerk's modal — the WebView
 * has no opener context for the popup. Instead we open Clerk's hosted sign-in
 * page which handles OAuth, then redirects back to the app via deep-link.
 */
export const getLoginUrl = (): string => {
  if (Capacitor.isNativePlatform()) {
    // Derive the Clerk hosted accounts domain from the publishable key.
    // pk_test_dWx0... → decode base64 after prefix → clerk.accounts.dev domain
    // Format: https://accounts.<your-clerk-domain>/sign-in
    const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
    try {
      // The publishable key encodes the frontend API URL: pk_<env>_<base64url(frontendApi + "$")>
      const b64 = publishableKey.replace(/^pk_(test|live)_/, "");
      const frontendApi = atob(b64).replace(/\$$/, ""); // e.g. "ultimate-camel-49.clerk.accounts.dev"
      return `https://${frontendApi}/sign-in`;
    } catch {
      // Fallback to the production URL
      return "https://accounts.clerk.com/sign-in";
    }
  }
  // On web, callers should use Clerk's <SignInButton mode="modal"> instead.
  // This is only called on native, but provide a sensible web fallback.
  return `${window.location.origin}/sign-in`;
};

