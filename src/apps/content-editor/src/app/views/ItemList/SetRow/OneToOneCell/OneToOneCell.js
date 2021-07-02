import { PureComponent } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "@zesty-io/core/Loader";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./OneToOneCell.less";
export class OneToOneCell extends PureComponent {
  render() {
    if (!this.props.field.relatedFieldZUID) {
      return (
        <span className={cx(this.props.className, styles.OneToOneCell)}>
          <AppLink
            to={`/schema/${this.props.field.contentModelZUID}/field/${this.props.field.ZUID}`}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            &nbsp;Missing field configuration
          </AppLink>
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

    const relatedField =
      this.props.allFields[this.props.field.relatedFieldZUID];
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
