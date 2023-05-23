import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
export default function ItemNavigation({ modelZUID, itemZUID, item }) {
  const slug = new URL(window.location).pathname.split("/").pop();

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
            slug !== "publishings" &&
            slug !== "analytics"
            ? styles.Selected
            : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        Edit Content
      </AppLink>
      <AppLink
        title="SEO"
        data-cy="meta"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "meta" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/meta`}
      >
        SEO
      </AppLink>
      <AppLink
        title="Analytics"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "analytics" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/analytics`}
      >
        Analytics
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
        title="API"
        data-cy="headless"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "headless" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/headless`}
      >
        {/* Headless <span className={styles.Hide}>Options</span>
         */}
        API
      </AppLink>
      <AppLink
        title="Publish State"
        data-cy="publishings"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "publishings" ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/publishings`}
      >
        Publish State
      </AppLink>
    </nav>
  );
}
