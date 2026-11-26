import { Dispatch } from "redux";
import i18n from "shell/i18n";
import { notify } from "shell/store/notifications";
import { ContentModelField } from "shell/services/types";

/**
 * Result contract for thunks that call the API.
 *
 * Every migrated thunk resolves (never rejects) one of:
 *  - `{ ok: true, data, status }`             success
 *  - `{ ok: false, kind: "request", ... }`    the request failed
 *  - `{ ok: false, kind: "validation", ... }` client-side validation failed
 *
 * Callers branch on `ok`, then on `kind` when they care which failure it was.
 * In TS files compare explicitly (`res.ok === false`): without
 * strictNullChecks, truthiness checks (`!res.ok`) do not narrow the union.
 *
 * Success carries only the API's `data` and the HTTP `status`. Other envelope
 * fields (`meta`, `message`, ...) are dropped, same as `getResponseData` in the
 * RTK Query services. A thunk that needs more passes `pick` to `toSuccess` and
 * declares the extras in its return type via `X`.
 *
 * A 204 resolves `data: undefined` with the response's status.
 *
 * Thunks build results with `toSuccess`, `toRequestFailure` and
 * `toValidationFailure`, never with object literals. The first two are used
 * together with `request(url, { rejectOnError: true })`.
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
export function toRequestFailure(err: any): RequestFailure {
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
