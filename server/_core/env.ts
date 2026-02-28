export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  stripePriceAnnual: process.env.STRIPE_PRICE_ANNUAL ?? "",
  stripePriceLifetime: process.env.STRIPE_PRICE_LIFETIME ?? "",
  // Clerk backend (for updating user metadata from webhook)
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  // RevenueCat Native Billing
  revenuecatGoogleKey: process.env.REVENUECAT_GOOGLE_KEY ?? "",
  revenuecatAppleKey: process.env.REVENUECAT_APPLE_KEY ?? "",
  revenuecatWebhookAuth: process.env.REVENUECAT_WEBHOOK_AUTH ?? "",
  // Firebase Admin (for sending push notifications)
  firebaseAdminCredentials: process.env.FIREBASE_ADMIN_CREDENTIALS ?? "",
  // Cron secret (shared between Vercel cron → /api/push/send)
  cronSecret: process.env.CRON_SECRET ?? "",
};
