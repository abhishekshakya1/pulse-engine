/**
 * PulseEngine - Standard API & Server Action Response Contracts
 * Follows Discriminated Union Pattern for 100% Type Safety
 */

// 1. All Known Error Codes across the Platform
export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_SERVER_ERROR"
  | "DATABASE_ERROR"
  | "AI_SERVICE_ERROR";

// 2. Standardized Error Payload
export interface ApiErrorDetail {
  code: ErrorCode | string;
  message: string;
  details?: Record<string, any> | Array<any>;
}

// 3. Success Response Shape
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// 4. Failure Response Shape
export interface ApiFailureResponse {
  success: false;
  error: ApiErrorDetail;
  timestamp: string;
}

// 5. Discriminated Union Type for All API Responses & Server Actions
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;
