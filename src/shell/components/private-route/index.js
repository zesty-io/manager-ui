import { memo, useEffect } from "react";
import { connect } from "react-redux";

import Login from "shell/components/login";

import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";

export default connect((state) => {
  return {
    auth: state.auth,
  };
})(
  memo(function PrivateRoute(props) {
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
    return <>{props.auth.valid ? props.children : <Login />}</>;
  })
);
