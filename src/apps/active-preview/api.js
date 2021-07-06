"use strict";

import Cookies from "js-cookie";

export default function api(url) {
  const token = Cookies.get(CONFIG.COOKIE_NAME);

  if (!token) {
    throw new Error("unauthenticated");
  }

  return fetch(`${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) =>
      res.json().then((json) => {
        return {
          ...json,
          // pass along status code to determine
          // if request was unauthenticated
          status: res.status,
        };
      })
    )
    .then((json) => {
      if (json.status === 401) {
        throw new Error("unauthenticated");
      } else {
        return json;
      }
    });
}
