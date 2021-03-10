import Cookies from "js-cookie";
import { store } from "shell/store";
import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";

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
        `Custom content-type: ${opts.headers["Content-Type"] ||
          opts.headers["content-type"]}`
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
    .then(res => {
      // console.log("Request:", res);

      // // Bad Request
      // if (res.status === 400) {}

      if (res.status === 401) {
        const state = store.getState();

        // When a token is set it means this user had previously logged in
        // but a request returned a 401, indicating their session has since
        // ended and we need them to re-login
        if (state.auth.token) {
          store.dispatch(
            notify({
              kind: "warn",
              message: "Your session has ended. Opening the login modal."
            })
          );

          setTimeout(() => {
            store.dispatch(verify());
          }, 5000);
        } else {
          // This may create a lot of noise in our error capturing
          // but I want to understand if we are seeing instances of this code path
          throw new Error(`401:RequestUnauthenticated: ${res.url}`);
        }
      }

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

      return res.json().then(function(json) {
        return { ...json, status: res.status };
      });
    })
    .then(json => {
      if (opts.callback) {
        opts.callback(json);
      }
      return json;
    })
    .catch(err => {
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
