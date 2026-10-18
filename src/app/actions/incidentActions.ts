"use server";

import { actionHandler } from "@/lib/asyncHandler";
import { UnauthorizedError } from "@/lib/errors";
import { getCurrentSession } from "@/lib/auth";
import {
  getOrganizationIncidents,
  resolveIncident,
} from "@/services/incidentService";
import { IncidentStatus } from "@prisma/client";

/**
 * 1. GET INCIDENTS ACTION
 * Fetches all incidents for the active organization
 */
export const getIncidentsAction = actionHandler(
  async (statusFilter?: IncidentStatus) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in to view incidents.");
    }

    const incidents = await getOrganizationIncidents(
      session.organizationId,
      statusFilter
    );

    return incidents;
  }
);

/**
 * 2. RESOLVE INCIDENT ACTION
 * Marks an incident as RESOLVED by organization admin
 */
export const resolveIncidentAction = actionHandler(
  async (incidentId: string) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("Unauthorized. Please log in.");
    }

    const resolved = await resolveIncident(
      incidentId,
      session.organizationId
    );

    return resolved;
  },
  "Incident marked as resolved."
);
