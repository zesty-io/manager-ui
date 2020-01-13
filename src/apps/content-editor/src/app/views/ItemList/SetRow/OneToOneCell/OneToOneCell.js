import React, { PureComponent } from "react";
import cx from "classnames";

import { Loader } from "@zesty-io/core/Loader";
import { Url } from "@zesty-io/core/Url";

import styles from "./OneToOneCell.less";
export class OneToOneCell extends PureComponent {
  render() {
    if (!this.props.field.relatedFieldZUID) {
      return (
        <span className={cx(this.props.className, styles.OneToOneCell)}>
          <Url
            href={`/schema/${this.props.field.contentModelZUID}/field/${this.props.field.ZUID}`}
          >
            <i className="fas fa-exclamation-triangle" />
            &nbsp;Missing field configuration
          </Url>
        </span>
      );
    }

    const relatedItemZUID = this.props.value;
    if (!relatedItemZUID || relatedItemZUID == "0") {
      return <span className={cx(this.props.className, styles.OneToOneCell)} />;
    }

    const relatedItem = this.props.allItems[relatedItemZUID];
    if (!relatedItem || !relatedItem.data) {
      this.props.loadItem(
        this.props.field.settings.relatedModel,
        relatedItemZUID
      );
      return (
        <span className={cx(this.props.className, styles.OneToOneCell)}>
          <Loader />
        </span>
      );
    }

    const relatedField = this.props.allFields[
      this.props.field.relatedFieldZUID
    ];
    if (!relatedField) {
      // TODO: if not relatedField, load specific field?
      return (
        <span className={cx(this.props.className, styles.OneToOneCell)}>
          <Loader />
        </span>
      );
    }

    if (
      relatedItem &&
      relatedItem.data &&
      relatedField &&
      relatedField.name &&
      String(relatedItem.data[relatedField.name])
    ) {
      return (
        <span className={cx(this.props.className, styles.OneToOneCell)}>
          {`${String(relatedItem.data[relatedField.name]).slice(0, 60)}${
            String(relatedItem.data[relatedField.name]).length > 60 ? "..." : ""
          }`}
        </span>
      );
    } else {
      return <span className={cx(this.props.className, styles.OneToOneCell)} />;
    }
  }
}
