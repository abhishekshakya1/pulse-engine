"use server";

import { actionHandler } from "@/lib/asyncHandler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTestAlert } from "@/services/alertService";

/**
 * 1. GET TENANT WEBHOOK URLS
 */
export const getAlertWebhooksAction = actionHandler(async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in to view alert settings.");
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: {
      plan: true,
      discordWebhookUrl: true,
      slackWebhookUrl: true,
    },
  });

  return {
    plan: org?.plan || "FREE",
    discordWebhookUrl: org?.discordWebhookUrl || "",
    slackWebhookUrl: org?.slackWebhookUrl || "",
  };
}, "Alert settings loaded.");

/**
 * 2. SAVE TENANT WEBHOOK URLS (Independent / Non-Destructive Partial Updates)
 */
export const saveAlertWebhooksAction = actionHandler(
  async (data: { discordWebhookUrl?: string; slackWebhookUrl?: string }) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be logged in to update alert settings.");
    }

    const { discordWebhookUrl, slackWebhookUrl } = data;
    const updateData: { discordWebhookUrl?: string | null; slackWebhookUrl?: string | null } = {};

    // Validate and process Discord Webhook ONLY if passed
    if (discordWebhookUrl !== undefined) {
      const cleanDiscord = discordWebhookUrl.trim();
      if (cleanDiscord.length > 0) {
        if (
          !cleanDiscord.startsWith("https://discord.com/api/webhooks/") &&
          !cleanDiscord.startsWith("https://discordapp.com/api/webhooks/")
        ) {
          throw new ValidationError(
            "Invalid Discord Webhook URL. Must begin with https://discord.com/api/webhooks/..."
          );
        }
        updateData.discordWebhookUrl = cleanDiscord;
      } else {
        updateData.discordWebhookUrl = null; // cleared intentionally
      }
    }

    // Validate and process Slack Webhook ONLY if passed
    if (slackWebhookUrl !== undefined) {
      const cleanSlack = slackWebhookUrl.trim();
      if (cleanSlack.length > 0) {
        const currentOrg = await prisma.organization.findUnique({
          where: { id: session.organizationId },
          select: { plan: true },
        });

        if (currentOrg?.plan !== "PRO") {
          throw new ForbiddenError(
            "Slack alerting is exclusive to PRO tier subscribers. Please upgrade to PRO to save a Slack webhook."
          );
        }
        if (!cleanSlack.startsWith("https://hooks.slack.com/services/")) {
          throw new ValidationError(
            "Invalid Slack Webhook URL. Must begin with https://hooks.slack.com/services/..."
          );
        }
        updateData.slackWebhookUrl = cleanSlack;
      } else {
        updateData.slackWebhookUrl = null; // cleared intentionally
      }
    }

    // If nothing provided, return current state
    if (Object.keys(updateData).length === 0) {
      const existing = await prisma.organization.findUnique({
        where: { id: session.organizationId },
        select: {
          id: true,
          discordWebhookUrl: true,
          slackWebhookUrl: true,
        },
      });
      return existing;
    }

    const updated = await prisma.organization.update({
      where: { id: session.organizationId },
      data: updateData,
      select: {
        id: true,
        discordWebhookUrl: true,
        slackWebhookUrl: true,
      },
    });

    return updated;
  },
  "Alert webhook channels saved successfully!"
);

/**
 * 3. DISPATCH INSTANT TEST PING
 */
export const testAlertWebhookAction = actionHandler(
  async (channel: "discord" | "slack") => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be logged in.");
    }

    const result = await sendTestAlert(session.organizationId, channel);
    return result;
  },
  "Test alert delivered successfully!"
);
