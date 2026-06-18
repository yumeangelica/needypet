import { isApiError } from '@/services';

/**
 * Standard result shape for store actions, so callers can show the backend's
 * message instead of a hardcoded generic string.
 */
export interface ApiResult {
  isSuccess: boolean;
  message?: string;
  errorDetails?: Record<string, string[]> | null;
}

const getErrorData = (error: unknown): Record<string, unknown> => {
  return isApiError(error) ? (error.response?.data ?? {}) : {};
};

/**
 * @description The HTTP status of a failed request, or undefined for network errors.
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  return isApiError(error) ? error.response?.status : undefined;
};

/**
 * @description The backend's `message` field, or the given fallback.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  const message = getErrorData(error).message;
  return typeof message === 'string' ? message : fallback;
};

/**
 * @description The backend's per-field `errorDetails`, or undefined.
 */
export const getErrorDetails = (error: unknown): Record<string, string[]> | undefined => {
  const details = getErrorData(error).errorDetails;
  return details && typeof details === 'object' ? (details as Record<string, string[]>) : undefined;
};

/**
 * @description The most descriptive message from a failed result: the first
 * per-field error if any, otherwise the result message, otherwise the fallback.
 */
export const resultMessage = (result: ApiResult, fallback: string): string => {
  if (result.errorDetails) {
    for (const messages of Object.values(result.errorDetails)) {
      if (messages?.[0]) {
        return messages[0];
      }
    }
  }
  return result.message || fallback;
};
