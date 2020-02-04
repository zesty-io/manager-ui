import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";

export default React.memo(function PrivateRoute(props) {
  const dispatch = useDispatch();
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    dispatch(verify())
      .then(res => {
        if (res.code === 200) {
          setAuth(true);
        } else {
          window.location = `${CONFIG.URL_ACCOUNTS}/login?redirect=${window.location}`;
        }
      })
      .catch(err => {
        notify({
          kind: "warn",
          message: "Failed to authenticate your account"
        });
      });
  }, []);

  return (
    <WithLoader
      condition={auth}
      message="Checking your account permissions"
      width="100vw"
      height="100vh"
    >
      {props.children}
    </WithLoader>
  );
});
