import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import Link from "@mui/material/Link";

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

import { loadOpenNav } from "../../store/ui";

import styles from "./LoadInstance.less";
import { Staging } from "../Staging";
import { CircularProgress } from "@mui/material";
import { useGetCurrentUserRolesQuery } from "../../services/accounts";

export default connect((state) => {
  return {
    instance: state.instance,
    user: state.user,
    products: state.products,
    languages: state.languages,
    files: state.files,
    role: state.userRole.systemRole.name,
  };
})(
  memo(function LoadInstance(props) {
    const [error, setError] = useState("");
    const { data: currentUserRoles } = useGetCurrentUserRolesQuery();

    useEffect(() => {
      props.dispatch(fetchInstance()).then((res) => {
        if (res.status !== 200) {
          setError("You do not have permission to access this instance");
        } else {
          document.title = `Manager - ${res.data?.name} - Zesty`;
          CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${res.data?.randomHashID}${CONFIG.URL_PREVIEW}`;
        }
      });

      Promise.all([
        props.dispatch(fetchUser(props.user.ZUID)),
        props.dispatch(fetchUserRole()),
      ]).then(() => {
        props.dispatch(fetchProducts());
      });

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
    }, []);

    useEffect(() => {
      if (
        window.pendo &&
        props.user?.email &&
        props.instance?.ZUID &&
        props.role
      ) {
        pendo.initialize({
          visitor: {
            id: props.user.ZUID,
            email: props.user.email,
            firstName: props.user.firstName,
            lastName: props.user.lastName,
            full_name: `${props.user.firstName} ${props.user.lastName}`,
            role: props.role,

            // You can add any additional visitor level key-values here,
            // as long as it's not one of the above reserved names.
            staff: props.user.staff,
            creationDate: props.user.createdAt,
          },

          account: {
            id: props.instance.ZUID,
            name: props.instance.name,
            creationDate: props.instance.createdAt,
            // You can add any additional account level key-values here,
            // as long as it's not one of the above reserved names.

            ecoID: props.instance.ecoID,
            ecoZUID: props.instance.ecoZUID,
            randomHashID: props.instance.randomHashID,
            domain: props.instance.domain,
          },
        });
      }
      //Check if pendo is running correctly open browser console and run pendo.validateInstall()
    }, [props.user, props.instance, props.role]);

    return (
      <>
        {error ? (
          <div className={styles.ErrorMessage}>
            <h1>{error}</h1>
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
          </div>
        ) : (
          <>
            {props.products &&
            props.instance.ID &&
            props.instance.domains &&
            props.user.ID &&
            props.languages.length &&
            props.files.length ? (
              props.children
            ) : (
              <Staging>
                <CircularProgress />
              </Staging>
            )}
          </>
        )}
      </>
    );
  })
);
