import Cookies from "js-cookie";
import { rest } from "lodash";
import { store } from "shell/store";
import i18n from "shell/i18n";
import { notify } from "../shell/store/notifications";
// import { endSession } from "shell/store/auth";

// Typed error thrown by request() when called with `rejectOnError: true`
export class RequestError extends Error {
  constructor({ status = 0, error, body } = {}) {
    super(
      error || `${i18n.t("shell.unknownError")}${status ? ` (${status})` : ""}`
    );
    this.name = "RequestError";
    this.status = status;
    this.error = this.message;
    this.body = body;
  }
}

// Normalize anything thrown/resolved by a migrated thunk to { error, status }
export function toRequestFailure(err) {
  return {
    error: (err && (err.error || err.message)) || i18n.t("shell.unknownError"),
    status: (err && err.status) || 0,
  };
}

/**
 * @typedef {{ error: string, status: number }} RequestFailure
 */

// True for a { error, status } result resolved by a migrated thunk
/**
 * @param {unknown} res
 * @returns {res is RequestFailure}
 */
export function isRequestFailed(res) {
  return (
    !!res &&
    typeof res === "object" &&
    !!res.error &&
    !(res.status >= 200 && res.status < 300)
  );
}

// Dispatch the shared error toast for a failed request
export function notifyFailure(dispatch, failure, message) {
  dispatch(
    notify({
      kind: "error",
      message:
        message ||
        i18n.t("shell.requestFailed", { error: failure?.error || "" }),
    })
  );
}

// Toast once for the first failure in a result or an array of results.
// Returns the input so it can sit in a promise chain.
export function notifyIfResponseFailed(dispatch, res) {
  const failure = Array.isArray(res) ? res.find(isRequestFailed) : res;
  if (isRequestFailed(failure)) {
    notifyFailure(dispatch, failure);
  }
  return res;
}

export function request(url, opts = {}) {
  if (!url) {
    throw new Error("A URL is required to make a request");
  }

  opts.headers = opts.headers || {};
  opts.headers["Authorization"] = `Bearer ${Cookies.get(CONFIG.COOKIE_NAME)}`;

  if (!opts.method && opts.body) {
    opts.method = "POST";
  }

  if (opts.body) {
    if (
      opts.headers &&
      (opts.headers["Content-Type"] || opts.headers["content-type"])
    ) {
      console.log(
        `Custom content-type: ${
          opts.headers["Content-Type"] || opts.headers["content-type"]
        }`
      );
    } else {
      if (opts.json) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(opts.body);
      } else {
        let formData = new FormData();
        // TODO: Add header support

        for (var key in opts.body) {
          if (opts.body.hasOwnProperty(key)) {
            formData.append(key, opts.body[key]);
          }
        }

        opts.body = formData;
      }
    }
  }

  opts.credentials = opts.credentials || "omit";
  opts.method = opts.method || "GET";

  return fetch(url, opts)
    .then(async (res) => {
      // console.log("Request:", res);

      //HTTP Code No Content 204
      if (res.status === 204) {
        return res;
      }

      // // Bad Request
      // if (res.status === 400) {}

      // if (res.status === 401) {
      //   store.dispatch(endSession());
      //   throw new Error(`401:Unauthenticated: ${res.url}`);
      // }

      // Not Found
      // if (res.status === 404) {}

      // if (res.status === 410) {
      //   // notify({message: `Your two factor authentication has expired. 410`});
      // }

      // if (res.status === 422) {}

      if (opts.rejectOnError && !res.ok) {
        // Body may not be JSON (e.g. a 502 HTML page), keep the status anyway
        const body = await res.json().catch(() => ({}));

        throw new RequestError({
          status: res.status,
          error:
            body?.error ||
            body?.message ||
            body?.error_message ||
            res.statusText ||
            undefined,
          body,
        });
      }

      if (res.status === 500) {
        // Throw on 500 to trigger callers catch statement
        throw new Error(`500:RequestError: ${res.url}`);
      }

      return res.json().then(function (json) {
        return { ...json, status: res.status };
      });
    })
    .then((json) => {
      if (opts.callback) {
        opts.callback(json);
      }
      return json;
    })
    .catch((err) => {
      if (opts.rejectOnError) {
        // Opt-in mode: never toast here, caller decides
        throw err instanceof RequestError
          ? err
          : new RequestError({ status: 0, error: err?.message });
      }

      if (err && err.res && err.res.status >= 500) {
        // Server Failed
        console.error(
          `${err.opts.method.toUpperCase()} ${err.url} | Code: ${
            err.res.status
          }`
        );
        throw err;
      } else {
        // Network errors
        store.dispatch(notify({ message: err.message, kind: "warn" }));
        return Promise.reject(
          err instanceof Error
            ? err
            : new Error(err.message || JSON.stringify(err))
        );
      }
    });
}
