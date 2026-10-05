export const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

export const errorMessage = (error: unknown): string => toError(error).message;
