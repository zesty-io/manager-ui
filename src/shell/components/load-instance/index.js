import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchInstance, fetchDomains } from "shell/store/instance";
import { fetchUser } from "shell/store/user";
import { fetchUserRole } from "shell/store/userRole";
import { fetchUsers } from "shell/store/users";
import { fetchProducts } from "shell/store/products";
import { detectPlatform } from "shell/store/platform";
import { fetchInstances } from "shell/store/instances";

import styles from "./LoadInstance.less";

export default connect(state => {
  return {
    instance: state.instance,
    user: state.user,
    products: state.products
  };
})(
  React.memo(function LoadInstance(props) {
    const [error, setError] = useState("");
    useEffect(() => {
      props
        .dispatch(fetchInstance())
        .then(res => {
          document.title = `Manager - ${res.data.name} - Zesty`;
          CONFIG.URL_PREVIEW_FULL = `${CONFIG.URL_PREVIEW_PROTOCOL}${res.data.randomHashID}${CONFIG.URL_PREVIEW}`;
        })
        .catch(res => {
          if (res.status === 403) {
            setError("You do not have permission to access to this instance");
          }
        });

      Promise.all([
        props.dispatch(fetchUser(props.user.ZUID)),
        props.dispatch(fetchUserRole())
      ]).then(() => {
        props.dispatch(fetchProducts());
      });

      props.dispatch(fetchDomains());
      props.dispatch(fetchUsers());
      props.dispatch(detectPlatform());
      props.dispatch(fetchInstances());
    }, []);

    return (
      <>
        {error ? (
          <div className={styles.ErrorMessage}>
            <h1>{error}</h1>
          </div>
        ) : (
          <WithLoader
            condition={
              props.products &&
              props.instance.ID &&
              props.instance.domains &&
              props.user.ID
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
