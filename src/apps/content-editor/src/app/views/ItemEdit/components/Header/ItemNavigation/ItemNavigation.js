import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCode,
  faTags,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

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
            slug !== "headless"
            ? styles.Selected
            : null
        )}
        to={`/content/${modelZUID}/${itemZUID}`}
      >
        <FontAwesomeIcon icon={faEdit} title="Edit Content" />
        <span>Edit Content</span>
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
        <FontAwesomeIcon icon={faCode} title="SEO & Meta" />
        <span>SEO &amp; Meta</span>
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
          <FontAwesomeIcon icon={faTags} title="Head Tags" />
          <span>Head Tags</span>
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
        <FontAwesomeIcon icon={faDatabase} title="Headless Options" />
        <span>Headless Options</span>
      </AppLink>
    </nav>
  );
}
