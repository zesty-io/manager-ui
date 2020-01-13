import React, { PureComponent } from "react";
import cx from "classnames";

import { Loader } from "@zesty-io/core/Loader";
import { Url } from "@zesty-io/core/Url";

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
          <i className={cx("fa fa-link", styles.empty)} aria-hidden="true" />
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
          <Url
            href={`//${CONFIG.MANAGER_URL}//content/${relatedItem.meta.contentModelZUID}/${relatedItem.meta.ZUID}`}
          >
            <i className="fa fa-link" aria-hidden="true" />
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
          </Url>
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
