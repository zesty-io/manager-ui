import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
export default function ItemNavigation({ modelZUID, itemZUID, item }) {
  const slug = window.location.href.split("/").pop();

  return (
    <nav className={styles.ItemNav}>
      <AppLink
        data-cy="content"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug !== "meta" &&
            slug !== "head" &&
            slug !== "preview" &&
            slug !== "headless"
            ? styles.Selected
            : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        Edit Content
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
        SEO &amp; Meta
      </AppLink>
      {item.web.path && (
        <AppLink
          data-cy="head"
          className={cx(
            styles.AppLink,
            styles.buttonText,
            slug === "head" ? styles.Selected : null
          )}
          to={`/content/${modelZUID}/${itemZUID}/head`}
        >
          Head Tags
        </AppLink>
      )}

      <AppLink
        data-cy="headless"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "headless" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/headless`}
      >
        Headless <span className={styles.Hide}>Options</span>
      </AppLink>
    </nav>
  );
}
