import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Box, Link, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import i18n from "shell/i18n";
import { store } from "shell/store";
import { fetchInstance, fetchDomains } from "shell/store/instance";
import { fetchUser } from "shell/store/user";
import { fetchUserRole } from "shell/store/userRole";
import { fetchUsers } from "shell/store/users";
import { fetchProducts } from "shell/store/products";
import { detectPlatform } from "shell/store/platform";
import { fetchInstances } from "shell/store/instances";
import { fetchLangauges } from "shell/store/languages";
import { fetchItemPublishings } from "shell/store/content";
import { fetchFiles } from "../../../apps/code-editor/src/store/files";
import { fetchSettings } from "shell/store/settings";
import { NoInstancePermission } from "./NoInstancePermission";
import { useGetCurrentUserRolesQuery } from "../../services/accounts";
import { isContentOne } from "../../../utility/isContentOne";

export default connect((state) => {
  return {
    instance: state.instance,
    user: state.user,
    products: state.products,
    languages: state.languages,
    files: state.files,
    role: state.userRole.systemRole.name,
    auth: state.auth,
  };
})(
  memo(function LoadInstance(props) {
    const [error, setError] = useState("");
    const [noPermission, setNoPermission] = useState(false);
    const { refetch: refetchCurrentUserRoles } = useGetCurrentUserRolesQuery();

    useEffect(() => {
      if (!props.auth.valid) {
        return;
      }

      props.dispatch(fetchUser(props.user.ZUID)).then(() => {
        const { prefs } = store.getState().user;
        const userLocale = prefs ? JSON.parse(prefs)?.locale : null;

        // Resolve the UI locale authoritatively from the logged-in user, falling
        // back to the default. This matters when switching users: localStorage
        // and i18n still hold the previous user's locale after logout, so a user
        // with no saved locale (or a different one) must reset to their own
        // rather than inherit the prior session's language.
        const targetLocale = userLocale || "en-US";

        if (targetLocale !== i18n.language) {
          i18n.changeLanguage(targetLocale);
          document.documentElement.lang = targetLocale;
        }
        localStorage.setItem("app_locale", targetLocale);
      });
      props
        .dispatch(fetchInstance())
        .then((res) => {
          if (res.status !== 200) {
            setNoPermission(true);
          } else {
            setNoPermission(false);
            const appName = isContentOne() ? "Content.one" : "Zesty.io";
            document.title = `Manager - ${res.data?.name} - ${appName}`;
            CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${res.data?.randomHashID}${CONFIG.URL_PREVIEW}`;

            // All other API calls should only be made if user has access to this instance
            // this prevents a slew of unnecessary 403 errors
            props.dispatch(fetchUserRole()).then(() => {
              props.dispatch(fetchProducts());
            });

            refetchCurrentUserRoles();
            props.dispatch(fetchDomains());
            props.dispatch(fetchUsers());
            props.dispatch(detectPlatform());
            props.dispatch(fetchInstances());
            props.dispatch(fetchLangauges());
            props.dispatch(fetchSettings());
            // Used in Publish Plan and Content sections
            props.dispatch(fetchItemPublishings());
            // Used in Code Editor, useFilePath Hook
            props.dispatch(fetchFiles("views"));
            props.dispatch(fetchFiles("stylesheets"));
            props.dispatch(fetchFiles("scripts"));
          }
        })
        .catch(() => {
          setError(i18n.t("shell.failedToLoadInstance"));
        });
    }, [props.auth.valid]);

    if (noPermission) {
      return <NoInstancePermission />;
    }

    if (error) {
      return (
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
            title={i18n.t("shell.zestyAccountTitle")}
            href={`${CONFIG.URL_ACCOUNTS}/instances`}
            sx={{ p: 2 }}
          >
            <FontAwesomeIcon icon={faUser} />
            &nbsp; {i18n.t("shell.goToAccounts")}
          </Link>
        </Box>
      );
    }

    return props.children;
  })
);
