export default function request(url, opts = {}) {
  if (!url) {
    throw new Error("A URL is required to make a request");
  }

  if (!opts.method && opts.body) {
    opts.method = "POST";
  }

  if (opts.body) {
    if (opts.json) {
      opts.headers = opts.headers || {};
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    } else {
      let formData = new FormData();

      for (var key in opts.body) {
        if (opts.body.hasOwnProperty(key)) {
          formData.append(key, opts.body[key]);
        }
      }

      opts.body = formData;
    }
  }

  // Default to authenticated requests
  opts.credentials = opts.credentials || "include";
  opts.method = opts.method || "GET";

  return fetch(url, opts)
    .then(res => {
      // console.log('Request:', res);
      if (res.ok) {
        if (res.status < 300) {
          try {
            return res.json();
          } catch (err) {
            // throw new Error('JSON could not be parsed for request ' + `${opts.method.toUpperCase()} ${url} | Code: ${res.status}`)
            throw err;
          }
        } else if (res.status >= 400) {
          // TODO I'm not sure 400 come back as a `res.ok` so we
          // may not be getting here.
          console.error(
            `${opts.method.toUpperCase()} ${url} | Code: ${res.status}`
          );

          if (res.status === 400) {
            // growl(`Bad request. ${json.message}`, 'red-growl')
            console.log(`Bad request. ${json.message}`);
          } else if (res.status === 401) {
            console.log("Unauthenticated, show login");
            // if (!document.getElementById('reloginWrap')) {
            //     riot.mount(document.querySelector('#modalMount'), 'login-modal', {
            //         email: USER.email,
            //         callback: () => {
            //             console.log('relogin complete');
            //         }
            //     })
            // }
          } else if (res.status === 404) {
            console.error("404: Not Found", res);
          } else if (res.status === 410) {
            console.log("Expired 2FA request");
          }

          // TODO should we form a json object response?
          return res;
        } else {
          return res;
        }
      } else {
        if (res.status === 422) {
          return res.json();
        } else {
          throw new Error("Network request failed.");
        }
      }
    })
    .then(json => {
      if (opts.callback) {
        opts.callback(json);
      }
      return json;
    })
    .catch(err => {
      console.error(err);
    });
}
