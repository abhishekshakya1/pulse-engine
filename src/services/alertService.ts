import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export interface AlertPayload {
  organizationId: string;
  incidentId: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  endpoint: string;
  statusCode?: number;
  latency?: number;
}

/**
 * Dispatches multi-channel alerts based on tenant tier and custom webhooks:
 * - FREE: Discord alerts (Tenant's custom webhook URL, or system fallback)
 * - PRO: Slack Block Kit + Discord multi-channel alerts (Tenant's custom Slack webhook)
 */
export async function dispatchAlerts(payload: AlertPayload): Promise<void> {
  const { organizationId, incidentId, title, severity, endpoint, statusCode, latency } = payload;

  // 1. Fetch Organization subscription plan & custom webhook URLs
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      plan: true,
      discordWebhookUrl: true,
      slackWebhookUrl: true,
    },
  });

  const isPro = org?.plan === "PRO";
  const color = severity === "CRITICAL" ? 0xff0033 : severity === "HIGH" ? 0xff9900 : 0x00ccff;

  // 2. DISCORD ALERT (Available for both FREE & PRO tiers)
  const discordWebhook = org?.discordWebhookUrl;
  if (discordWebhook) {
    try {
      await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `🚨 [${severity}] ${title}`,
              description: `An incident was detected on \`${endpoint}\` for **${org?.name || "Workspace"}**.`,
              color,
              fields: [
                { name: "Incident ID", value: incidentId, inline: true },
                { name: "Status Code", value: `${statusCode ?? "N/A"}`, inline: true },
                { name: "Latency", value: `${latency ?? "N/A"}ms`, inline: true },
              ],
              footer: { text: "PulseEngine Autonomous SRE" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      logger.info({ organizationId, incidentId }, "Discord incident alert delivered to webhook");
    } catch (err: any) {
      logger.error({ err: err.message, organizationId }, "Failed to send Discord alert");
    }
  } else {
    logger.info({ organizationId, incidentId }, "DISCORD_ALERT_MOCK: No webhook configured for tenant");
  }

  // 3. SLACK ALERT (Exclusive to PRO Plan!)
  if (isPro) {
    const slackWebhook = org?.slackWebhookUrl;
    if (slackWebhook) {
      try {
        await fetch(slackWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 [${severity}] ${title}`,
            blocks: [
              {
                type: "header",
                text: { type: "plain_text", text: `🚨 PulseEngine Alert: ${severity}` },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Organization:* *${org?.name}*\n*Endpoint:* \`${endpoint}\`\n*Status:* \`${statusCode}\` | *Latency:* \`${latency}ms\`\n*Incident:* \`${incidentId}\``,
                },
              },
            ],
          }),
        });
        logger.info({ organizationId, incidentId }, "Slack Block Kit alert delivered to webhook");
      } catch (err: any) {
        logger.error({ err: err.message, organizationId }, "Failed to send Slack alert");
      }
    } else {
      logger.info({ organizationId, incidentId }, "SLACK_ALERT_MOCK: No Slack webhook configured for PRO tenant");
    }
  } else {
    logger.info({ organizationId }, "Slack alert skipped (Slack is exclusive to PRO tier)");
  }
}

/**
 * Dispatches an instant test ping to verify customer's webhook configuration
 */
export async function sendTestAlert(
  organizationId: string,
  channel: "discord" | "slack"
): Promise<{ success: boolean; message: string }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      plan: true,
      discordWebhookUrl: true,
      slackWebhookUrl: true,
    },
  });

  if (!org) {
    throw new Error("Organization not found.");
  }

  if (channel === "discord") {
    const webhook = org.discordWebhookUrl;
    if (!webhook) {
      throw new Error("No Discord Webhook URL provided. Please enter and save your webhook URL first.");
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `✅ [TEST ALERT] PulseEngine Discord Integration`,
            description: `Congratulations! Your Discord webhook for **${org.name}** is actively connected to PulseEngine.`,
            color: 0x10b981,
            fields: [
              { name: "Organization", value: org.name, inline: true },
              { name: "Plan", value: org.plan, inline: true },
              { name: "Status", value: "Verified & Active", inline: true },
            ],
            footer: { text: "PulseEngine Autonomous SRE" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Discord rejected the webhook (HTTP ${res.status}). Please verify the URL.`);
    }

    return { success: true, message: "Test alert delivered to your Discord channel!" };
  } else {
    if (org.plan !== "PRO") {
      throw new Error("Slack alerting is exclusive to the PRO plan. Please upgrade to activate Slack integration.");
    }

    const webhook = org.slackWebhookUrl;
    if (!webhook) {
      throw new Error("No Slack Webhook URL provided. Please enter and save your webhook URL first.");
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `✅ [TEST ALERT] PulseEngine Slack Integration Verified for ${org.name}!`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "✅ PulseEngine Integration Verified" },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Congratulations! Your Slack channel for *${org.name}* (PRO Plan) is successfully connected to the autonomous SRE incident stream.`,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Slack rejected the webhook (HTTP ${res.status}). Please verify the URL.`);
    }

    return { success: true, message: "Test alert delivered to your Slack channel!" };
  }
}

// Backward compatibility alias for incidentService
export const dispatchMultiChannelAlert = dispatchAlerts;
