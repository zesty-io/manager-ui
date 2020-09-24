import React from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

// import { Url } from "@zesty-io/core/Url";

import styles from "./ItemNavigation.less";
export const ItemNavigation = ({
  modelZUID,
  itemZUID,
  item: {
    web: { metaLinkText, metaTitle, metaDescription }
  }
}) => {
  const slug = window.location.href.split("/").pop();
  return (
    <ul className={styles.ItemNavigation}>
      <li data-cy="content">
        <Link
          className={cx(
            styles.Item,
            slug === "content" ? styles.Selected : null
          )}
          to={`/content/${modelZUID}/${itemZUID}`}
        >
          CONTENT
        </Link>
      </li>
      <li
        data-cy="meta"
        className={cx(
          !metaDescription || !metaLinkText || !metaTitle
            ? styles.Missing
            : null
        )}
      >
        <Link
          className={cx(styles.Item, slug === "meta" ? styles.Selected : null)}
          to={`/content/${modelZUID}/${itemZUID}/meta`}
        >
          META
        </Link>
      </li>
      <li>
        <Link
          data-cy="head"
          className={cx(styles.Item, slug === "head" ? styles.Selected : null)}
          to={`/content/${modelZUID}/${itemZUID}/head`}
        >
          HEAD
        </Link>
      </li>
    </ul>
  );
};
