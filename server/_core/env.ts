export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  stripePriceAnnual: process.env.STRIPE_PRICE_ANNUAL ?? "",
  stripePriceLifetime: process.env.STRIPE_PRICE_LIFETIME ?? "",
  // Clerk backend
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
