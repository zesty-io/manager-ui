import React, { useEffect } from "react";
import { connect } from "react-redux";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { fetchUser } from "shell/store/user";
import { fetchUserRole } from "shell/store/userRole";
import { fetchProducts } from "shell/store/products";
import { detectPlatform } from "shell/store/platform";
import { fetchLangauges } from "shell/store/languages";
import { fetchItemPublishings } from "shell/store/content";
import {
  useGetDomainsQuery,
  useGetInstanceQuery,
  useGetInstancesQuery,
  useGetUsersQuery
} from "shell/services/accounts";
import styles from "./LoadInstance.less";

// TODO: update all references to state.instances, state.instance,
// state.domains, state.users to use new hooks

export default connect(state => {
  return {
    user: state.user,
    products: state.products,
    languages: state.languages
  };
})(
  React.memo(function LoadInstance(props) {
    const domainsQuery = useGetDomainsQuery();
    const instanceQuery = useGetInstanceQuery();
    const instancesQuery = useGetInstancesQuery();
    const usersQuery = useGetUsersQuery();

    let errorMessage = "";
    if (instanceQuery.error?.status === 403) {
      errorMessage = "You do not have permission to access this instance";
    } else if (domainsQuery.error) {
      errorMessage = "Failed loading domains";
    } else if (instanceQuery.error) {
      errorMessage = "Failed loading instance";
    } else if (instancesQuery.error) {
      errorMessage = "Failed loading instances";
    } else if (usersQuery.error) {
      errorMessage = "Failed loading users";
    }

    useEffect(() => {
      if (instanceQuery.data) {
        document.title = `Manager - ${instanceQuery.data.name} - Zesty`;
        CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${instanceQuery.data.randomHashID}${CONFIG.URL_PREVIEW}`;
      }
    }, [instanceQuery.data]);

    useEffect(() => {
      Promise.all([
        props.dispatch(fetchUser(props.user.ZUID)),
        props.dispatch(fetchUserRole())
      ]).then(() => {
        props.dispatch(fetchProducts());
      });

      props.dispatch(detectPlatform());
      props.dispatch(fetchLangauges("enabled"));
      // Used in Publish Plan and Content sections
      props.dispatch(fetchItemPublishings());
    }, []);

    return (
      <>
        {errorMessage ? (
          <div className={styles.ErrorMessage}>
            <h1>{errorMessage}</h1>
          </div>
        ) : (
          <WithLoader
            condition={
              props.products &&
              props.instance.ID &&
              props.user.ID &&
              props.languages.length &&
              !domainsQuery.isLoading &&
              !instancesQuery.isLoading &&
              !usersQuery.isLoading
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
