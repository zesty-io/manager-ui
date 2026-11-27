import { Dispatch } from "redux";
import i18n from "shell/i18n";
import { notify } from "shell/store/notifications";
import { ContentModelField } from "shell/services/types";

/**
 * Thunks resolve `{ ok: true, data, status }` or a failure with `kind` "request"
 * or "validation". Branch on `ok`, then `kind`. In TS compare `res.ok === false`,
 * truthiness doesn't narrow without strictNullChecks. Extra envelope fields are
 * opt-in via `toSuccess`'s `pick`.
 */

export type RequestFailure = {
  ok: false;
  kind: "request";
  status: number;
  error: string;
};

export type ValidationFields = {
  missingRequired?: ContentModelField[];
  lackingCharLength?: ContentModelField[];
  regexPatternMismatch?: ContentModelField[];
  regexRestrictPatternMatch?: ContentModelField[];
  invalidRange?: ContentModelField[];
  invalidBlockVariantValue?: ContentModelField[];
};

export type ValidationFailure = {
  ok: false;
  kind: "validation";
  fields: ValidationFields;
};

export type ThunkSuccess<T, X extends object = {}> = {
  ok: true;
  data: T;
  status: number;
} & X;

export type ThunkResult<T, X extends object = {}> =
  | ThunkSuccess<T, X>
  | RequestFailure
  | ValidationFailure;

type ApiResponse<T> = { data: T; status: number } & Record<string, any>;

/**
 * Builds the success result from what `request()` resolved.
 * `pick` returns extra fields from the raw response to add to the result.
 */
export function toSuccess<T, X extends object = {}>(
  res: Response | ApiResponse<T>,
  pick?: (res: ApiResponse<T>) => X
): ThunkSuccess<T, X> {
  // request() resolves the raw Response on 204, there is no body to read
  if (res instanceof Response) {
    return {
      ok: true,
      data: undefined as T,
      status: res.status,
    } as ThunkSuccess<T, X>;
  }

  return {
    ok: true,
    data: res.data,
    status: res.status,
    ...(pick?.(res) as X),
  };
}

// Normalizes anything thrown (RequestError, Error, ...) to a request failure
export function toRequestFailure(
  err: { error?: string; message?: string; status?: number } | undefined
): RequestFailure {
  return {
    ok: false,
    kind: "request",
    error: (err && (err.error || err.message)) || i18n.t("shell.unknownError"),
    status: (err && err.status) || 0,
  };
}

export function toValidationFailure(
  fields: ValidationFields
): ValidationFailure {
  return { ok: false, kind: "validation", fields };
}

// Dispatch the shared error toast for a failed request
export function notifyFailure(
  dispatch: Dispatch,
  failure: Pick<RequestFailure, "error"> | undefined,
  message?: string
) {
  dispatch(
    notify({
      kind: "error",
      message:
        message ||
        i18n.t("shell.requestFailed", { error: failure?.error || "" }),
    })
  );
}

// any: callers pass untyped dispatch results
// Toast once for the first request failure in a result or an array of results.
// Validation failures are skipped, callers render those inline.
// Returns the input so it can sit in a promise chain.
export function notifyIfResponseFailed<
  R extends ThunkResult<any, any> | ThunkResult<any, any>[]
>(dispatch: Dispatch, res: R): R {
  const results: ThunkResult<any, any>[] = Array.isArray(res) ? res : [res];
  const failure = results.find(
    (r): r is RequestFailure => !!r && !r.ok && r.kind === "request"
  );

  if (failure) {
    notifyFailure(dispatch, failure);
  }

  return res;
}
