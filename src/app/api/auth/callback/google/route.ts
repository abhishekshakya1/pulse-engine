import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME, SessionPayload } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { Role, Plan } from "@prisma/client";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Check if auth code received from Google
  if (!code) {
    logger.warn({}, "[OAUTH_CALLBACK] No authorization code found in URL.");
    return NextResponse.redirect(`${appUrl}?error=oauth_code_missing`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    // 2. Exchange authorization code for Google Access Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      logger.error({ err: tokenData }, "[OAUTH_TOKEN_EXCHANGE_FAILED]");
      return NextResponse.redirect(`${appUrl}?error=oauth_token_exchange_failed`);
    }

    // 3. Fetch user profile from Google using the access token
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser: GoogleUser = await profileRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}?error=oauth_email_not_provided`);
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();

    // 4. Multi-Tenant Database Sync in Neon DB
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organization: true,
      },
    });

    let organizationId: string;
    let organizationName: string;

    if (user) {
      // Case A: User already exists -> Use existing organization
      organizationId = user.organization.id;
      organizationName = user.organization.name;
    } else {
      // Case B: First-time Google user -> Atomic creation of Org + User + API Key
      const companyName = `${googleUser.name || "My"}'s Team`;
      const baseSlug = companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
      const initialApiKey = `pe_live_${crypto.randomBytes(16).toString("hex")}`;

      const [newOrg, newUser] = await prisma.$transaction(async (tx) => {
        const orgRecord = await tx.organization.create({
          data: {
            name: companyName,
            slug,
            plan: Plan.FREE,
            monthlyQuota: 100000,
            eventsCount: 0,
          },
        });

        const userRecord = await tx.user.create({
          data: {
            email: cleanEmail,
            name: googleUser.name || null,
            passwordHash: "", // Google OAuth users don't need a password hash
            role: Role.ADMIN,
            organizationId: orgRecord.id,
          },
        });

        await tx.apiKey.create({
          data: {
            name: "Default Ingestion Key",
            key: initialApiKey,
            rateLimit: 60,
            organizationId: orgRecord.id,
          },
        });

        return [orgRecord, userRecord];
      });

      organizationId = newOrg.id;
      organizationName = newOrg.name;
      user = { ...newUser, organization: newOrg } as any;
    }

    // 5. Create JWT Session Payload & Token
    const sessionPayload: SessionPayload = {
      userId: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
      organizationId,
      organizationName,
    };

    const token = await createSessionToken(sessionPayload);

    logger.info(
      { email: cleanEmail, org: organizationName },
      `[GOOGLE_AUTH_SUCCESS] User signed in via Google: ${cleanEmail}`
    );

    // 6. Attach cookie DIRECTLY to the redirect response!
    const response = NextResponse.redirect(`${appUrl}`);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, // XSS Attack protection
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;
  } catch (error) {
    logger.error({ err: error }, "[OAUTH_CALLBACK_EXCEPTION]");
    return NextResponse.redirect(`${appUrl}?error=oauth_internal_error`);
  }
}
