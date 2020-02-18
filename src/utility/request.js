import Cookies from "js-cookie";

export function request(url, opts = {}) {
  if (!url) {
    throw new Error("A URL is required to make a request");
  }

  opts.headers = opts.headers || {};

  // Attach session token
  const token = Cookies.get(CONFIG.COOKIE_NAME);
  opts.headers["X-Auth"] = token;

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

  opts.credentials = opts.credentials || "include";
  opts.method = opts.method || "GET";

  return fetch(url, opts)
    .then(res => {
      // console.log("Request:", res);

      try {
        // // Bad Request
        // if (res.status === 400) {}

        // // User not authenticatd. Trigger login flow
        // if (res.status === 401) {}

        // Not Found
        // if (res.status === 404) {}

        // if (res.status === 410) {
        //   // growl(`Your two factor authentication has expired. 410`, "red-growl");
        // }

        // if (res.status === 422) {}

        return res.json().then(function(json) {
          return { ...json, status: res.status };
        });
      } catch (err) {
        console.error(err);
        // growl(
        //   `We ran into an issue processing an API response.`,
        //   "red-growl"
        // );
      }

      // Server Failed
      if (res.status >= 500) {
        throw { res, opts, url };
      }

      // If a result hasn't been returned yet return the response
      return res;
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
        // growl(`Request failed, our API had an issue. 500`, "red-growl");
        throw err;
      } else {
        // Network Failed
        console.error(err);
        // growl(`A network request failed.`, "red-growl");
        throw err;
      }
    });
}
