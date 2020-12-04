import React from "react";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
export default function ItemNavigation({ modelZUID, itemZUID }) {
  const slug = window.location.href.split("/").pop();

  return (
    <nav className={styles.ItemNav}>
      <AppLink
        data-cy="content"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug !== "meta" && slug !== "head" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        Content
      </AppLink>
      <AppLink
        data-cy="meta"
        className={cx(
          styles.AppLink,
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
          styles.AppLink,
          styles.buttonText,
          slug === "head" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/head`}
      >
        Head
      </AppLink>
    </nav>
  );
}
