import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";
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

import { Url } from "@zesty-io/core/Url";
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
  };
})(
  memo(function LoadInstance(props) {
    const [error, setError] = useState("");
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
      if (window.Appcues && props.user && props.instance && props.role) {
        window.Appcues.identify(
          props.user.ZUID, // unique, required
          {
            createdAt: props.user.createdAt, // Unix timestamp of user signup date

            role: props.role, // Current user’s role or permissions
            accountId: props.instance.ZUID, // Current user's account ID
            firstName: props.user.firstName, // current user's first name

            // additional suggestions

            companyName: props.instance.name, // Current user’s company name
            email: props.user.email, // Current user's email
            staff: props.user.staff, // Zesty staff
          }
        );
      }
    }, [props.user, props.instance, props.role]);

    return (
      <>
        {error ? (
          <div className={styles.ErrorMessage}>
            <h1>{error}</h1>
            <Url
              className={styles.AccountLink}
              title="Zesty Account"
              href={`${CONFIG.URL_ACCOUNTS}/instances`}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp; Go to Accounts
            </Url>
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
