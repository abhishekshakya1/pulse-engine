import { createPolar } from "@polar-sh/sdk/2026-10";

if (!process.env.POLAR_ACCESS_TOKEN) {
  console.warn("⚠️ Warning: POLAR_ACCESS_TOKEN is not set in environment variables.");
}

// Polar SDK Singleton instance
export const polar = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  environment: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
});

// Pro Plan Product ID from Polar Dashboard
export const POLAR_PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID || "";
