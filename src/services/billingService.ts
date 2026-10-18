import { prisma } from "@/lib/prisma";
import { polar, POLAR_PRO_PRODUCT_ID } from "@/lib/polar";
import { logger } from "@/lib/logger";
import { BadRequestError, NotFoundError } from "@/lib/errors";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Creates a Polar.sh hosted checkout session for upgrading an organization to PRO.
 */
export async function createCheckoutSession(
  organizationId: string,
  userEmail: string,
  userId: string
) {
  // 1. Organization exist karti hai?
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new NotFoundError("Organization not found.");
  }

  // 2. Already Pro plan par toh nahi hai?
  if (org.plan === "PRO") {
    throw new BadRequestError("This organization is already on the PRO plan.");
  }

  if (!POLAR_PRO_PRODUCT_ID) {
    throw new BadRequestError("POLAR_PRO_PRODUCT_ID is missing in configuration.");
  }

  logger.info({ organizationId, userEmail }, "Creating Polar checkout session...");

  // 3. Create checkout session via Polar SDK
  const checkout = await polar.checkouts.create({
    products: [POLAR_PRO_PRODUCT_ID],
    customer_email: userEmail,
    success_url: `${APP_URL}/dashboard?billing=success`,
    metadata: {
      organizationId,
      userId,
    },
  });

  logger.info(
    { organizationId, checkoutId: checkout.id, url: checkout.url },
    "Polar checkout session created successfully"
  );

  return {
    checkoutId: checkout.id,
    checkoutUrl: checkout.url,
    url: checkout.url,
  };
}

/**
 * Upgrades an organization to PRO plan in Neon PostgreSQL (500k monthly quota).
 * Called securely by the Polar Webhook.
 */
export async function upgradeOrganizationToPro(
  organizationId: string,
  _subscriptionId?: string
) {
  const updatedOrg = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      plan: "PRO",
      monthlyQuota: 500000, // 500k events/month
    },
  });

  logger.info(
    { organizationId, plan: updatedOrg.plan, quota: updatedOrg.monthlyQuota },
    "Organization successfully upgraded to PRO tier!"
  );

  return updatedOrg;
}

/**
 * Downgrades an organization back to FREE tier if subscription is cancelled.
 */
export async function downgradeOrganizationToFree(organizationId: string) {
  const updatedOrg = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      plan: "FREE",
      monthlyQuota: 10000, // 10k events/month
    },
  });

  logger.warn(
    { organizationId, plan: updatedOrg.plan },
    "Organization downgraded to FREE tier."
  );

  return updatedOrg;
}
