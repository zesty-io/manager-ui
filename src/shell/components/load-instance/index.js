import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Box, Link, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

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

      props.dispatch(fetchUser(props.user.ZUID));
      props
        .dispatch(fetchInstance())
        .then((res) => {
          if (res.status !== 200) {
            setNoPermission(true);
          } else {
            document.title = `Manager - ${res.data?.name} - Zesty`;
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
          setError("Failed to load instance");
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
            title="Zesty Account"
            href={`${CONFIG.URL_ACCOUNTS}/instances`}
            sx={{ p: 2 }}
          >
            <FontAwesomeIcon icon={faUser} />
            &nbsp; Go to Accounts
          </Link>
        </Box>
      );
    }

    return props.children;
  })
);
