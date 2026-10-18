import { AppError } from "./errors";
import { logger } from "./logger";
import {
  jsonSuccess,
  jsonError,
  createSuccessResponse,
  createErrorResponse,
} from "./response";
import { ApiResponse } from "@/types/api";

/**
 * 1. apiHandler - Next.js Route Handler wrapper (Express asyncHandler equivalent)
 * Wraps Route Handlers (GET, POST, PUT, DELETE) so you never write try-catch in routes.
 */
export function apiHandler(
  handlerFn: (req: Request, context?: any) => Promise<any>,
  successStatusCode: number = 200
) {
  return async (req: Request, context?: any) => {
    const start = performance.now();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    try {
      const result = await handlerFn(req, context);
      const duration = Math.round(performance.now() - start);

      // Clean Pino Success Info Log
      logger.info(
        { method, path, status: successStatusCode, duration: `${duration}ms` },
        `[${successStatusCode}] ${method} ${path} (${duration}ms)`
      );

      return jsonSuccess(result, undefined, successStatusCode);
    } catch (error) {
      const duration = Math.round(performance.now() - start);

      // Case A: Operational Error (401, 404, 422) -> Clean WARN (No messy stack trace)
      if (error instanceof AppError) {
        logger.warn(
          {
            method,
            path,
            status: error.statusCode,
            duration: `${duration}ms`,
            code: error.code,
          },
          `[${error.statusCode}] ${method} ${path} (${duration}ms) ➔ ${error.message}`
        );
      } else {
        // Case B: Real Bug (500) -> ERROR Log with Stack Trace
        logger.error(
          { method, path, status: 500, duration: `${duration}ms`, err: error },
          `[500 CRITICAL] ${method} ${path} (${duration}ms)`
        );
      }

      return jsonError(error);
    }
  };
}

/**
 * 2. actionHandler - Server Action wrapper for Next.js ("use server")
 * Wraps Server Actions so React components get standard responses without server crashes.
 */
export function actionHandler<TArgs extends any[], TResult>(
  actionFn: (...args: TArgs) => Promise<TResult>,
  successMessage?: string
) {
  return async (...args: TArgs): Promise<ApiResponse<TResult>> => {
    try {
      const result = await actionFn(...args);
      return createSuccessResponse(result, successMessage);
    } catch (error) {
      // Case A: Expected Operational Error (Wrong password, duplicate email) -> Clean WARN
      if (error instanceof AppError) {
        logger.warn(
          { code: error.code, status: error.statusCode },
          `[ACTION_WARN] [${error.statusCode}] ${error.message}`
        );
      } else {
        // Case B: Unexpected Crash / 500 Bug -> Full ERROR Stack Trace for debugging
        logger.error({ err: error }, "[SERVER_ACTION_CRITICAL_ERROR]");
      }

      return createErrorResponse(error);
    }
  };
}
