import { NextRequest, NextResponse } from "next/server";
import { webhooks } from "@polar-sh/sdk/2026-10";
import { logger } from "@/lib/logger";
import {
  upgradeOrganizationToPro,
  downgradeOrganizationToFree,
} from "@/services/billingService";
import { sendProWelcomeEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    // Headers convert karein standard format me
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let event: any;

    // Agar webhook secret configure hai, toh cryptographic signature verify karein
    if (webhookSecret) {
      try {
        event = await webhooks.validateEvent(rawBody, headers, webhookSecret);
      } catch (err: any) {
        logger.error({ err: err.message }, "Polar webhook signature verification failed");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      // Local development fallback agar secret abhi set nahi kiya hai
      logger.warn("POLAR_WEBHOOK_SECRET is not set. Parsing body without signature verification for dev.");
      event = JSON.parse(rawBody);
    }

    const eventType = event.type;
    logger.info({ eventType }, "Received Polar Webhook event");

    // Event handling logic
    switch (eventType) {
      case "order.created":
      case "subscription.created":
      case "subscription.active": {
        const data = event.data;
        const organizationId =
          data?.metadata?.organizationId || data?.custom_field_data?.organizationId;
        const subscriptionId = data?.id;

        if (organizationId) {
          // 1. Upgrade Org to PRO & 500k quota in Neon PostgreSQL
          const updatedOrg = await upgradeOrganizationToPro(organizationId, subscriptionId);
          logger.info({ organizationId }, "Organization upgraded to PRO via webhook");

          // 2. 📧 Send Branded Welcome to PRO Email
          const userEmail =
            data?.customer?.email || data?.customer_email || data?.email;

          if (userEmail) {
            await sendProWelcomeEmail({
              toEmail: userEmail,
              organizationName: updatedOrg.name,
              monthlyQuota: updatedOrg.monthlyQuota,
            });
          }
        } else {
          logger.warn({ data }, "No organizationId found in webhook event metadata");
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const data = event.data;
        const organizationId =
          data?.metadata?.organizationId || data?.custom_field_data?.organizationId;

        if (organizationId) {
          await downgradeOrganizationToFree(organizationId);
          logger.info({ organizationId }, "Organization downgraded to FREE via webhook");
        }
        break;
      }

      default:
        logger.info({ eventType }, "Unhandled Polar webhook event type");
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    logger.error({ err: error.message }, "Error processing Polar webhook");
    return NextResponse.json(
      { error: "Internal webhook handler error" },
      { status: 500 }
    );
  }
}
