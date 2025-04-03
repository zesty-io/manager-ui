import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Backdrop, Box, Link, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import Login from "shell/components/login";
import { notify } from "shell/store/notifications";
import { verify } from "shell/store/auth";
import { LoadingQuote } from "../LoadingQuote";
import { fetchInstance } from "../../store/instance";

export default connect((state) => {
  return {
    auth: state.auth,
  };
})(
  memo(function PrivateRoute(props) {
    const [error, setError] = useState("");
    const [isLoadingInstance, setIsLoadingInstance] = useState(true);

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

    useEffect(() => {
      if (!props.auth.valid) {
        return;
      }

      setIsLoadingInstance(true);
      props
        .dispatch(fetchInstance())
        .then((res) => {
          if (res.status !== 200) {
            setError("You do not have permission to access this instance");
          } else {
            document.title = `Manager - ${res.data?.name} - Zesty`;
            CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${res.data?.randomHashID}${CONFIG.URL_PREVIEW}`;
          }
        })
        .finally(() => {
          setIsLoadingInstance(false);
        });
    }, [props.auth.valid]);

    // if (props.auth.checking || isLoadingInstance) {
    //   return (
    //     <Box width="100vw" height="100vh">
    //       <LoadingQuote />
    //     </Box>
    //   );
    // }

    return (
      <>
        {error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              flexDirection: "column",
            }}
          >
            <Typography variant="h1">{error}</Typography>
            <Link
              underline="none"
              color="secondary"
              title="Zesty Account"
              href={`${CONFIG.URL_ACCOUNTS}/instances`}
              sx={{ p: 2 }}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp; Go to Accounts
            </Link>
          </Box>
        ) : (
          props.children
        )}

        <Backdrop
          sx={{
            zIndex: (theme) => theme.zIndex.tooltip + 10, // Needs to be on top of everything
            bgcolor: "background.paper",
          }}
          open={!props.auth.checking && !props.auth.valid}
        >
          <Login />
        </Backdrop>
      </>
    );
  })
);
