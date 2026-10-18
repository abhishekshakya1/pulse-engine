"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { actionHandler } from "@/lib/asyncHandler";
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@/lib/errors";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentSession,
  SessionPayload,
} from "@/lib/auth";
import { Role, Plan } from "@prisma/client";

// Input Types
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  organizationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * 1. REGISTER ACTION
 * Creates: Organization + Admin User + Default API Key + Sets JWT Cookie
 */
export const registerAction = actionHandler(
  async (input: RegisterInput) => {
    const { email, password, name, organizationName } = input;

    // 1. Basic Validations
    if (!email || !email.includes("@")) {
      throw new ValidationError("Please provide a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long.");
    }
    if (!organizationName || organizationName.trim().length === 0) {
      throw new ValidationError("Organization/Company name is required.");
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw new ConflictError("A user with this email address already exists.");
    }

    // 3. Hash Password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create Unique Org Slug (e.g. "acme-corp-a1b2")
    const baseSlug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const uniqueSuffix = crypto.randomBytes(3).toString("hex");
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // 5. Generate Initial API Key
    const initialApiKey = `pe_live_${crypto.randomBytes(16).toString("hex")}`;

    // 6. Atomic Transaction: Org + User + API Key
    const [org, user] = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          slug,
          plan: Plan.FREE,
          monthlyQuota: 10000,
          eventsCount: 0,
        },
      });

      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: name?.trim() || null,
          role: Role.ADMIN,
          organizationId: newOrg.id,
        },
      });

      await tx.apiKey.create({
        data: {
          name: "Default Ingestion Key",
          key: initialApiKey,
          rateLimit: 60,
          organizationId: newOrg.id,
        },
      });

      return [newOrg, newUser];
    });

    // 7. Create Session & Set Secure Cookie
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: org.id,
      organizationName: org.name,
    };

    const token = await createSessionToken(sessionPayload);
    await setSessionCookie(token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
      },
    };
  },
  "Registration successful! Welcome to PulseEngine."
);

/**
 * 2. LOGIN ACTION
 * Validates credentials -> Sets JWT Cookie
 */
export const loginAction = actionHandler(
  async (input: LoginInput) => {
    const { email, password } = input;

    if (!email || !password) {
      throw new ValidationError("Email and password are required.");
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          },
        },
      },
    });

    // Security practice: Don't reveal if email was wrong or password was wrong
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 2. Verify Password Hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 3. Create Session & Set Secure Cookie
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organization.id,
      organizationName: user.organization.name,
    };

    const token = await createSessionToken(sessionPayload);
    await setSessionCookie(token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: user.organization,
    };
  },
  "Logged in successfully."
);

/**
 * 3. LOGOUT ACTION
 * Clears the session cookie
 */
export const logoutAction = actionHandler(async () => {
  await clearSessionCookie();
  return { message: "Logged out successfully." };
}, "Logout successful.");

/**
 * 4. GET CURRENT SESSION ACTION
 * Returns active user session
 */
export const getSessionAction = actionHandler(async () => {
  const session = await getCurrentSession();
  return session;
});
