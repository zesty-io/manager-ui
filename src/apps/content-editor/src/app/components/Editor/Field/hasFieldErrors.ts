import type { Error } from "./FieldShell";

// True when any field has a truthy error entry
export const hasFieldErrors = (errors: Record<string, Error>) =>
  Object.values(errors).some((error) =>
    Object.values(error ?? {}).some(Boolean)
  );
