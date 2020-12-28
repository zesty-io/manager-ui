import Cookies from "js-cookie";
import { notify } from "shell/store/notifications";

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
      console.log(`Custom content-type: ${JSON.stringify(opts.headers)}`);
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

      // User not authenticatd. Trigger login flow
      if (res.status === 401) {
        notify({
          kind: "warn",
          message: "You are not authenticated. You may need to login."
        });
        // throw { res, opts, url };
      }

      // Not Found
      // if (res.status === 404) {}

      // if (res.status === 410) {
      //   // notify({message: `Your two factor authentication has expired. 410`});
      // }

      // if (res.status === 422) {}

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
