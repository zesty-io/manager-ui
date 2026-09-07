import { memo, useEffect } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Backdrop } from "@mui/material";

import Login from "shell/components/login";
import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";

export default connect((state) => {
  return {
    auth: state.auth,
  };
})(
  memo(function PrivateRoute(props) {
    const { t } = useTranslation();

    useEffect(() => {
      const checkSession = () => {
        props.dispatch(verify()).catch(() => {
          props.dispatch(
            notify({
              kind: "warn",
              message: t("shell.failedAuthenticateAccount"),
            })
          );
        });
      };

      // Poll auth service every minute to ensure session is still valid
      const token = setInterval(checkSession, 60000);

      // Initial app load check
      checkSession();

      return () => clearInterval(token);
    }, [props.dispatch, t]);

    useEffect(() => {
      const handleOffline = () => {
        props.dispatch(
          notify({
            kind: "warn",
            message: t("shell.internetConnectionOff"),
          })
        );
      };

      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("offline", handleOffline);
      };
    }, [props.dispatch, t]);

    useEffect(() => {
      const handleOnline = () => {
        props.dispatch(
          notify({
            kind: "success",
            message: t("shell.internetConnectionRestored"),
          })
        );
      };

      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("online", handleOnline);
      };
    }, [props.dispatch, t]);

    return (
      <>
        {props.children}

        <Backdrop
          sx={{
            zIndex: (theme) => theme.zIndex.tooltip + 10, // Needs to be on top of everything
          }}
          open={!props.auth.checking && !props.auth.valid}
        >
          <Login />
        </Backdrop>
      </>
    );
  })
);
