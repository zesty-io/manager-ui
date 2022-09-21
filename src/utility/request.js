import Cookies from "js-cookie";
import { rest } from "lodash";
import { ZUID_REGEX } from "./regex";
// import { store } from "shell/store";
// import { endSession } from "shell/store/auth";

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
    .then((res) => {
      //HTTP Code No Content 204
      if (res.status === 204) {
        return res;
      }

      // Bad Request
      if (res.status === 400) {
        /* 
          On bad request we do not want to throw an error and reject the promise in order
          to avoid disrupting the dispatch flow of the application. Instead we want to return
          the empty response object or array that is expected by the application. In order to determine
          if the expectation is an object or array we check the url for the presence of a ZUID. If
          the ZUID is present we expect an single resource object, otherwise we expect an multi resource array.
        */

        if (ZUID_REGEX.test(url.split("?")[0].split("/").pop())) {
          return {};
        } else {
          return [];
        }
      }

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
      if (err && err.res && err.res.status >= 500) {
        // Server Failed
        console.error(
          `${err.opts.method.toUpperCase()} ${err.url} | Code: ${
            err.res.status
          }`
        );
        throw err;
      } else {
        throw err;
      }
    });
}
