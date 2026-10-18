import { logger } from "@/lib/logger";
import nodemailer from "nodemailer";

export interface ProWelcomeEmailParams {
  toEmail: string;
  organizationName: string;
  monthlyQuota: number;
}

/**
 * Sends a branded "Welcome to PulseEngine PRO" email when a subscription is activated.
 * Supported Delivery Modes:
 * 1. Gmail SMTP via Nodemailer (100% Free, NO Domain Required, sends to ANY recipient!)
 * 2. Local Mock Logger fallback (when SMTP credentials are unset in local test environments)
 */
export async function sendProWelcomeEmail(params: ProWelcomeEmailParams): Promise<void> {
  const { toEmail, organizationName, monthlyQuota } = params;

  const subject = `🎉 Welcome to PulseEngine PRO, ${organizationName}!`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090A; color: #FFFFFF; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #101216; border: 1px solid #23272F; border-radius: 12px; padding: 32px; }
          .header { border-bottom: 1px solid #23272F; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px; }
          .badge { background: #6366F1; color: #FFFFFF; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
          .title { font-size: 20px; font-weight: 600; margin-top: 16px; color: #FFFFFF; }
          .list { background: #16181D; border-radius: 8px; padding: 16px 24px; margin: 24px 0; border: 1px solid #23272F; }
          .list li { margin: 10px 0; font-size: 14px; color: #E2E8F0; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748B; border-top: 1px solid #23272F; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">⚡ PulseEngine</span> <span class="badge">PRO ACTIVE</span>
          </div>
          <div class="title">Your organization "${organizationName}" has been upgraded to PRO!</div>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">
            Thank you for subscribing to PulseEngine. Your account has been unlocked with full enterprise capabilities:
          </p>
          <div class="list">
            <ul>
              <li><strong>Monthly Telemetry Buffer:</strong> ${(monthlyQuota).toLocaleString()} events/month</li>
              <li><strong>API Rate Limit:</strong> 1,000 requests/minute (High throughput)</li>
              <li><strong>Autonomous AI SRE:</strong> Unlimited 24/7 Google Gemini 3.8 Flash Root-Cause Diagnoses</li>
              <li><strong>Multi-Channel Alerting:</strong> Slack Block Kit + Discord Embeds</li>
            </ul>
          </div>
          <div class="footer">
            PulseEngine B2B Telemetry & AI SRE Copilot Platform • All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. GMAIL SMTP VIA NODEMAILER (100% Free, Zero Domain, sends to ANY customer!)
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      // Dispatch directly to the subscribing customer's email address
      const destination = toEmail;

      const info = await transporter.sendMail({
        from: `"PulseEngine SRE Platform" <${gmailUser}>`,
        to: destination,
        subject,
        html: htmlBody,
      });

      logger.info(
        { messageId: info.messageId, toEmail, organizationName },
        "🎉 Real Pro Welcome Email sent successfully via Gmail SMTP (Zero domain required)!"
      );
      return;
    } catch (err: any) {
      logger.error({ err: err.message }, "Gmail SMTP dispatch failed, logging mock email...");
    }
  }

  // 2. MOCK LOGGER FALLBACK (For offline/testing without SMTP credentials)
  logger.info(
    { toEmail, organizationName, subject },
    "EMAIL_DISPATCHED_MOCK: [PRO Welcome Email logged to console]"
  );
}
