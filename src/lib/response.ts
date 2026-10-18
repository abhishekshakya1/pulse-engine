import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { ApiSuccessResponse, ApiFailureResponse } from "@/types/api";

const isDev = process.env.NODE_ENV === "development";

/**
 * 1. Standard Success Response Creator (Pure Data Object)
 * Useful for Server Actions and internal service returns
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 2. Standard Failure Response Creator (Pure Data Object)
 * Converts any unknown error into our standard failure contract
 */
export function createErrorResponse(error: unknown): ApiFailureResponse {
  const timestamp = new Date().toISOString();

  // Case A: Custom Trusted Operational Error (AppError)
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp,
    };
  }

  // Case B: Standard JavaScript Error
  if (error instanceof Error) {
    // Development vs Production Safety
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isDev
          ? error.message
          : "An unexpected server issue occurred. Our automated SRE engine has been notified. Please try again in a few moments.",
        details: isDev ? { stack: error.stack } : undefined,
      },
      timestamp,
    };
  }

  // Case C: Completely Unknown Value thrown (e.g. string or object)
  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDev
        ? "An unknown server exception occurred."
        : "A temporary system exception occurred. Please refresh or retry shortly.",
    },
    timestamp,
  };
}

/**
 * 3. Next.js Route Handler JSON Helpers
 * For API routes: returns real NextResponse with exact HTTP status codes
 */
export function jsonSuccess<T>(data: T, message?: string, statusCode: number = 200) {
  return NextResponse.json(createSuccessResponse(data, message), {
    status: statusCode,
  });
}

export function jsonError(error: unknown) {
  const responsePayload = createErrorResponse(error);
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  return NextResponse.json(responsePayload, {
    status: statusCode,
  });
}
