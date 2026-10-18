"use server";
import { sendProWelcomeEmail } from "@/services/emailService";

import { actionHandler } from "@/lib/asyncHandler";
import { getCurrentSession } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { createCheckoutSession } from "@/services/billingService";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * 1. Creates a Polar.sh hosted checkout session for the logged-in user's organization.
 */
export const createCheckoutSessionAction = actionHandler(async () => {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in to manage billing.");
  }

  // 2. Checkout session generate karein
  const checkoutData = await createCheckoutSession(
    session.organizationId,
    session.email,
    session.userId
  );

  return {
    url: checkoutData.checkoutUrl || checkoutData.url,
    checkoutId: checkoutData.checkoutId,
  };
}, "Checkout session created successfully.");

/**
 * 2. Fetches the current organization's subscription plan, monthly quota, and API key.
 */
export const getBillingStatusAction = actionHandler(async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in to view billing status.");
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      monthlyQuota: true,
      eventsCount: true,
      discordWebhookUrl: true,
      slackWebhookUrl: true,
      createdAt: true,
      apiKeys: {
        select: { key: true },
        take: 1,
      },
    },
  });

  return {
    id: org?.id,
    name: org?.name,
    slug: org?.slug,
    plan: org?.plan,
    monthlyQuota: org?.monthlyQuota,
    eventsCount: org?.eventsCount,
    discordWebhookUrl: org?.discordWebhookUrl || "",
    slackWebhookUrl: org?.slackWebhookUrl || "",
    createdAt: org?.createdAt,
    apiKey: org?.apiKeys?.[0]?.key || "pe_live_fallback_key",
  };
}, "Billing status retrieved.");

/**
 * 3. Dev Helper: Resets organization back to FREE tier for testing the upgrade flow.
 */
export const resetToFreePlanAction = actionHandler(async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in.");
  }

  const updatedOrg = await prisma.organization.update({
    where: { id: session.organizationId },
    data: {
      plan: "FREE",
      monthlyQuota: 10000,
    },
  });

  return updatedOrg;
}, "Plan reset to FREE tier for testing.");

/**
 * 4. Upgrades organization to PRO tier (500k monthly quota, unlimited AI diagnoses, Slack alerts).
 */
export const upgradeToProAction = actionHandler(async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in.");
  }

  const updatedOrg = await prisma.organization.update({
    where: { id: session.organizationId },
    data: {
      plan: "PRO",
      monthlyQuota: 500000,
    },
  });

  // Dispatch Welcome Email
  try {
    await sendProWelcomeEmail({
      toEmail: session.email,
      organizationName: updatedOrg.name,
      monthlyQuota: updatedOrg.monthlyQuota,
    });
  } catch (emailErr) {
    logger.error({ err: emailErr, organizationId: session.organizationId }, "Failed to dispatch welcome email");
  }

  return updatedOrg;
}, "Organization successfully upgraded to PRO tier!");
