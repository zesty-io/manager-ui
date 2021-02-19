import React, { PureComponent } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "@zesty-io/core/Loader";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./InternalLinkCell.less";
export class InternalLinkCell extends PureComponent {
  render() {
    if (!this.props.relatedItemZUID || this.props.relatedItemZUID == "0") {
      return (
        <span
          className={cx(
            this.props.className,
            styles.InternalLinkCell,
            styles.Empty
          )}
        >
          <FontAwesomeIcon className={styles.empty} icon={faLink} />
        </span>
      );
    }

    const relatedItem = this.props.allItems[this.props.relatedItemZUID];
    if (
      relatedItem &&
      relatedItem.web &&
      relatedItem.meta &&
      relatedItem.meta.contentModelZUID
    ) {
      return (
        <span className={cx(this.props.className, styles.InternalLinkCell)}>
          <AppLink
            to={`/content/${relatedItem.meta.contentModelZUID}/${relatedItem.meta.ZUID}`}
          >
            <FontAwesomeIcon icon={faLink} />
            &nbsp;
            <span>
              {relatedItem.web.metaTitle ? (
                relatedItem.web.metaTitle > 80 ? (
                  <span>
                    {relatedItem.web.metaTitle.substr(0, 80)}
                    &hellip;
                  </span>
                ) : (
                  relatedItem.web.metaTitle
                )
              ) : (
                this.props.relatedItemZUID
              )}
            </span>
          </AppLink>
        </span>
      );
    } else {
      this.props.searchItem(this.props.relatedItemZUID);
      return (
        <span className={cx(this.props.className, styles.InternalLinkCell)}>
          <Loader />
        </span>
      );
    }
  }
}
