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
    <ul className={styles.ItemNavigation}>
      <li data-cy="content">
        <AppLink
          className={cx(
            styles.Item,
            slug === "content" ? styles.Selected : null
          )}
          to={`/content/${modelZUID}/${itemZUID}`}
        >
          Content
        </AppLink>
      </li>
      <li
        data-cy="meta"
        className={cx(
          !metaDescription || !metaLinkText || !metaTitle
            ? styles.Missing
            : null
        )}
      >
        <AppLink
          className={cx(styles.Item, slug === "meta" ? styles.Selected : null)}
          to={`/content/${modelZUID}/${itemZUID}/meta`}
        >
          Meta
        </AppLink>
      </li>
      {userRole.name !== "Contributor" && (
        <li>
          <AppLink
            data-cy="head"
            className={cx(
              styles.Item,
              slug === "head" ? styles.Selected : null
            )}
            to={`/content/${modelZUID}/${itemZUID}/head`}
          >
            Head
          </AppLink>
        </li>
      )}
    </ul>
  );
});
