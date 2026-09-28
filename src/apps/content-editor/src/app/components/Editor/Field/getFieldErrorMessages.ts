import type { Error } from "./FieldShell";

type TranslateFn = (key: string, options?: Record<string, any>) => string;

/**
 * Builds the ordered list of human-readable validation messages for a field's
 * Error object. Shared by FieldError (item-level error summary) and FieldShell
 * (inline message under each field) so the copy lives in one place. Pass the
 * component's `t` (from useTranslation("content")) — backend-sourced messages
 * (regex/range/custom) are already localized upstream and passed through as-is.
 */
export const getFieldErrorMessages = (
  errors: Error,
  t: TranslateFn
): string[] => {
  const errorMessages: string[] = [];

  if (errors?.MISSING_REQUIRED) {
    errorMessages.push(t("content.requiredFieldError"));
  }

  if (errors?.EXCEEDING_MAXLENGTH > 0) {
    errorMessages.push(
      t("content.exceedingMaxLength", { count: errors.EXCEEDING_MAXLENGTH })
    );
  }

  if (errors?.LACKING_MINLENGTH > 0) {
    errorMessages.push(
      t("content.requiresMoreCharacters", { count: errors.LACKING_MINLENGTH })
    );
  }

  if (errors?.REGEX_PATTERN_MISMATCH) {
    errorMessages.push(errors.REGEX_PATTERN_MISMATCH);
  }

  if (errors?.REGEX_RESTRICT_PATTERN_MATCH) {
    errorMessages.push(errors.REGEX_RESTRICT_PATTERN_MATCH);
  }

  if (errors?.INVALID_RANGE) {
    errorMessages.push(errors.INVALID_RANGE);
  }

  if (errors?.CUSTOM_ERROR) {
    errorMessages.push(errors.CUSTOM_ERROR);
  }

  if (errors?.INVALID_BLOCK_VARIANT) {
    errorMessages.push(t("content.selectBlockVariant"));
  }

  return errorMessages;
};
