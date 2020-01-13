import React from "react";
import cx from "classnames";

import { Url } from "@zesty-io/core/Url";

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
        <Url
          className={cx(
            styles.Item,
            slug === "content" ? styles.Selected : null
          )}
          href={`/content/${modelZUID}/${itemZUID}/content`}
        >
          Content
        </Url>
      </li>
      <li
        data-cy="meta"
        className={cx(
          !metaDescription || !metaLinkText || !metaTitle
            ? styles.Missing
            : null
        )}
      >
        <Url
          className={cx(styles.Item, slug === "meta" ? styles.Selected : null)}
          href={`/content/${modelZUID}/${itemZUID}/meta`}
        >
          Meta
        </Url>
      </li>
      <li>
        <Url
          data-cy="head"
          className={cx(styles.Item, slug === "head" ? styles.Selected : null)}
          href={`/content/${modelZUID}/${itemZUID}/head`}
        >
          Head
        </Url>
      </li>
    </ul>
  );
};
