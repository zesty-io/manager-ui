import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemNavigation.less";
import { apiTypes } from "../../../../../../../../schema/src/app/components/ModelApi";
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
            slug !== "api" &&
            !apiTypes.includes(slug) &&
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
      {item.web.path && (
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
      )}
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
        data-cy="api"
        className={cx(
          styles.AppLink,
          styles.buttonText,
          slug === "api" || apiTypes.includes(slug) ? styles.Selected : null
        )}
        to={`/content/${modelZUID}/${itemZUID}/api`}
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
