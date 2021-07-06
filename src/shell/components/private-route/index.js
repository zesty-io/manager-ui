import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import Login from "shell/components/login";

import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";

export default connect((state) => {
  return {
    auth: state.auth,
  };
})(
  React.memo(function PrivateRoute(props) {
    useEffect(() => {
      const checkSession = () => {
        props.dispatch(verify()).catch(() => {
          props.dispatch(
            notify({
              kind: "warn",
              message: "Failed to authenticate your account",
            })
          );
        });
      };

      // Poll auth service every minute to ensure session is still valid
      const token = setInterval(checkSession, 60000);

      // Initial app load check
      checkSession();

      return () => clearInterval(token);
    }, [props.dispatch]);

    useEffect(() => {
      const handleOffline = () => {
        props.dispatch(
          notify({
            kind: "warn",
            message: "Internet connection is off",
          })
        );
      };

      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("offline", handleOffline);
      };
    });

    useEffect(() => {
      const handleOnline = () => {
        props.dispatch(
          notify({
            kind: "success",
            message: "Internet connection is restored",
          })
        );
      };

      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("online", handleOnline);
      };
    });
    return (
      <WithLoader
        condition={!props.auth.checking}
        message="Checking your account permissions"
        width="100vw"
        height="100vh"
      >
        {props.auth.valid ? props.children : <Login />}
      </WithLoader>
    );
  })
);
