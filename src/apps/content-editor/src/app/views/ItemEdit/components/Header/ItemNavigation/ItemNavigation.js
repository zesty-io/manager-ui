import React from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
export default connect(state => {
  return {
    userRole: state.userRole
  };
})(function ItemNavigation({
  modelZUID,
  itemZUID,
  item: {
    web: { metaLinkText, metaTitle, metaDescription }
  },
  userRole
}) {
  const slug = window.location.href.split("/").pop();
  return (
    <nav className={styles.ItemNav}>
      <AppLink
        className={cx(
          styles.buttonText,
          slug === "content" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        Content
      </AppLink>
      <AppLink
        className={cx(
          styles.buttonText,
          slug === "meta" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/meta`}
      >
        Meta
      </AppLink>
      <AppLink
        data-cy="head"
        className={cx(
          styles.buttonText,
          slug === "head" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/head`}
      >
        Head
      </AppLink>
    </nav>
  );
});
