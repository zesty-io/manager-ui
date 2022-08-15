import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
export default function ItemNavigation({ modelZUID, itemZUID, item }) {
  const slug = window.location.href.split("/").pop();

  return (
    <nav className={styles.ItemNav}>
      <AppLink
        title="Edit Content"
        data-cy="content"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug !== "meta" &&
            slug !== "head" &&
            slug !== "preview" &&
            slug !== "headless" &&
            slug !== "publish-history"
            ? styles.Selected
            : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        Edit Content
      </AppLink>
      <AppLink
        title="SEO & Meta"
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
          title="Head Tags"
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
        title="Headless Options"
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
      <AppLink
        title="Publish History"
        data-cy="publish-history"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "publish-history" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/publish-history`}
      >
        Publish History
      </AppLink>
    </nav>
  );
}
