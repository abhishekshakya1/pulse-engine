/**
 * Safe Type-Checked Environment Variables
 * Validates critical environment keys at runtime
 */

const requiredServerEnvKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

const optionalServerEnvKeys = [
  "GEMINI_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "POLAR_ACCESS_TOKEN",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
] as const;

function validateEnv() {
  const missingKeys: string[] = [];

  for (const key of requiredServerEnvKeys) {
    if (!process.env[key]) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ [ENV_WARNING] Missing required environment variables:\n  - ${missingKeys.join(
        "\n  - "
      )}\nPlease define them in your .env file.`
    );
  }
}

// Run initial validation check
validateEnv();

export const env = {
  // Database & Auth
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",

  // AI SRE Copilot
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "",

  // Rate Limiting & Telemetry Ingestion Buffer
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",

  // Polar.sh SaaS Billing
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN || "",
  POLAR_PRO_PRODUCT_ID: process.env.POLAR_PRO_PRODUCT_ID || "",
  POLAR_SERVER: process.env.POLAR_SERVER || "sandbox",

  // Environment & Domain
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
