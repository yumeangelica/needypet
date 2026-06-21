import { describe, expect, it } from 'vitest';
import {
  type ApiResult,
  getErrorDetails,
  getErrorMessage,
  getErrorStatus,
  resultMessage,
} from '@/lib/apiError';
import type { ApiError } from '@/services';

const apiError = (status: number, data: Record<string, unknown> = {}): ApiError => {
  const error = new Error(`Request failed with status ${status}`) as ApiError;
  error.response = { status, data };
  return error;
};

describe('getErrorStatus', () => {
  it('returns the HTTP status from an ApiError', () => {
    expect(getErrorStatus(apiError(404))).toBe(404);
  });

  it('returns undefined for a plain Error (no response)', () => {
    expect(getErrorStatus(new Error('plain error'))).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(getErrorStatus(null)).toBeUndefined();
  });

  it('returns undefined for a string', () => {
    expect(getErrorStatus('some string')).toBeUndefined();
  });

  it('returns undefined for an ApiError with no response', () => {
    const error = new Error('bare api error') as ApiError;
    // response is not set
    expect(getErrorStatus(error)).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  it('returns the backend message when present', () => {
    expect(getErrorMessage(apiError(422, { message: 'Validation failed' }), 'fallback')).toBe(
      'Validation failed',
    );
  });

  it('returns the fallback when message is absent', () => {
    expect(getErrorMessage(apiError(500), 'Something went wrong')).toBe('Something went wrong');
  });

  it('returns the fallback when message is not a string', () => {
    expect(getErrorMessage(apiError(500, { message: 42 }), 'fallback')).toBe('fallback');
  });

  it('returns the fallback for a plain Error', () => {
    expect(getErrorMessage(new Error('plain'), 'fallback')).toBe('fallback');
  });

  it('returns the fallback for null', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });
});

describe('getErrorDetails', () => {
  it('returns errorDetails object when present', () => {
    const details = { userName: ['Too short'] };
    expect(getErrorDetails(apiError(422, { errorDetails: details }))).toEqual(details);
  });

  it('returns undefined when errorDetails is absent', () => {
    expect(getErrorDetails(apiError(422, { message: 'no details' }))).toBeUndefined();
  });

  it('returns undefined when errorDetails is not an object', () => {
    expect(getErrorDetails(apiError(422, { errorDetails: 'not-an-object' }))).toBeUndefined();
  });

  it('returns undefined for a plain Error', () => {
    expect(getErrorDetails(new Error('plain'))).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(getErrorDetails(null)).toBeUndefined();
  });
});

describe('resultMessage', () => {
  it('returns the first per-field error from errorDetails', () => {
    const result: ApiResult = {
      isSuccess: false,
      message: 'Generic error',
      errorDetails: {
        userName: ['Username too short'],
        email: ['Invalid email'],
      },
    };
    expect(resultMessage(result, 'fallback')).toBe('Username too short');
  });

  it('returns result.message when there are no errorDetails', () => {
    const result: ApiResult = {
      isSuccess: false,
      message: 'Something failed',
    };
    expect(resultMessage(result, 'fallback')).toBe('Something failed');
  });

  it('returns the fallback when message is empty and no errorDetails', () => {
    const result: ApiResult = {
      isSuccess: false,
      message: '',
    };
    expect(resultMessage(result, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when message and errorDetails are both missing', () => {
    const result: ApiResult = { isSuccess: false };
    expect(resultMessage(result, 'fallback')).toBe('fallback');
  });

  it('skips empty per-field arrays and falls back to message', () => {
    const result: ApiResult = {
      isSuccess: false,
      message: 'Root message',
      errorDetails: { userName: [] },
    };
    expect(resultMessage(result, 'fallback')).toBe('Root message');
  });

  it('works on a success result with a message', () => {
    const result: ApiResult = {
      isSuccess: true,
      message: 'Operation succeeded',
    };
    expect(resultMessage(result, 'fallback')).toBe('Operation succeeded');
  });
});
