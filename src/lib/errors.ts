import { ErrorCode } from "@/types/api";

/**
 * Base Application Error
 * All operational/custom errors inherit from this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any> | Array<any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = "INTERNAL_SERVER_ERROR",
    details?: Record<string, any> | Array<any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details?: any) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

// 401 Unauthorized (Missing/invalid token or session)
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access", details?: any) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

// 403 Forbidden (Authenticated but not allowed)
export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden", details?: any) {
    super(message, 403, "FORBIDDEN", details);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: any) {
    super(message, 404, "NOT_FOUND", details);
  }
}

// 409 Conflict (e.g. Email already registered)
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details?: any) {
    super(message, 409, "CONFLICT", details);
  }
}

// 422 Validation Error
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

// 429 Rate Limit Exceeded
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please slow down.", details?: any) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", details);
  }
}

// Alias for 429
export { RateLimitError as TooManyRequestsError };

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}
