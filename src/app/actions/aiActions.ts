"use server";

import { actionHandler } from "@/lib/asyncHandler";
import { getCurrentSession } from "@/lib/auth";
import { UnauthorizedError, BadRequestError } from "@/lib/errors";
import { diagnoseIncident, diagnoseDemoIncident } from "@/services/aiService";

/**
 * Triggers autonomous Google Gemini Root-Cause Analysis for an incident.
 */
export const diagnoseIncidentAction = actionHandler(async (incidentId: string) => {
  // 1. Session verification
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("You must be logged in to diagnose incidents.");
  }

  // 2. Input validation
  if (!incidentId || typeof incidentId !== "string") {
    throw new BadRequestError("Valid Incident ID is required.");
  }

  // 3. Call AI SRE Service
  const updatedIncident = await diagnoseIncident(incidentId, session.organizationId);

  return updatedIncident;
}, "AI Diagnosis generated and saved successfully.");

/**
 * Public action for Landing Page Interactive Demo Sandbox.
 * Provides real-time Gemini 3.8 Flash triage without requiring account creation.
 */
export const diagnoseDemoIncidentAction = actionHandler(async (payload: {
  scenario: "CRITICAL_500" | "LATENCY_SPIKE";
  logs: Array<{ time: string; method: string; route: string; status: number; latency: number; error?: string }>;
}) => {
  if (!payload || !payload.scenario) {
    throw new BadRequestError("Valid scenario is required.");
  }

  const result = await diagnoseDemoIncident(payload.scenario, payload.logs || []);
  return result;
}, "Demo AI Diagnosis generated successfully.");
