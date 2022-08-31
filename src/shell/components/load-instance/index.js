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
    const [pendoInit, setPendoInit] = useState(false);
    useEffect(() => {
      props
        .dispatch(fetchInstance())
        .then((res) => {
          document.title = `Manager - ${res.data.name} - Zesty`;
          CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${res.data.randomHashID}${CONFIG.URL_PREVIEW}`;
        })
        .catch((res) => {
          if (res.status === 403) {
            setError("You do not have permission to access to this instance");
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
      props.dispatch(fetchLangauges("enabled"));
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
        props.auth?.valid &&
        window.pendo &&
        props.user?.email &&
        props.instance?.ZUID &&
        props.role
      ) {
        const pendoData = {
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
        };
        if (!pendoInit) {
          pendo.initialize(pendoData);
          setPendoInit(true);
        } else {
          pendo.identify(pendoData);
        }
      }
      //Clean-up function to clear pendo session when a user is logged out
      return () => pendo.clearSession();
    }, [props.user, props.instance, props.role, props.auth, props.auth.valid]);

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
          <WithLoader
            condition={
              props.products &&
              props.instance.ID &&
              props.instance.domains &&
              props.user.ID &&
              props.languages.length &&
              props.files.length
            }
            message="Loading Instance"
            width="100vw"
            height="100vh"
          >
            {props.children}
          </WithLoader>
        )}
      </>
    );
  })
);
