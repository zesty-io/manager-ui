import React, { PureComponent } from "react";
import cx from "classnames";

import { Tag } from "@zesty-io/core/Tag";
import { Url } from "@zesty-io/core/Url";

import styles from "./OneToManyCell.less";
export class OneToManyCell extends PureComponent {
  onRemove = (name, itemZUID) => {
    this.props.onRemove(
      this.props.name,
      this.props.value
        .split(",")
        .filter(item => item !== itemZUID)
        .join(",")
    );
  };

  render() {
    // OneToMany Fields require a relationship to be defined
    if (!this.props.settings || !this.props.field.relatedFieldZUID) {
      return (
        <span
          className={cx(
            this.props.className,
            styles.OneToManyCell,
            styles.ErrorCell
          )}
        >
          <Url
            href={`/#!/schema/${this.props.field.contentModelZUID}/field/${this.props.field.ZUID}`}
          >
            <i className="fas fa-exclamation-triangle" />
            &nbsp;Missing field configuration
          </Url>
        </span>
      );
    } else {
      const relatedItemZUIDs = this.props.value.split(",").filter(ZUID => ZUID);
      const relatedItems = relatedItemZUIDs.map(
        ZUID => this.props.allItems[ZUID]
      );

      if (!relatedItems.length) {
        // No items have been related so render a blank cell
        return (
          <span className={cx(this.props.className, styles.OneToManyCell)} />
        );
      } else {
        const relatedField = this.props.allFields[
          this.props.field.relatedFieldZUID
        ];

        // NOTE: user WithLoader and show loading message with related field name

        if (relatedField && relatedField.name) {
          return (
            <span className={cx(this.props.className, styles.OneToManyCell)}>
              {relatedItems.length &&
                relatedItems
                  .filter(item => item)
                  .map((item, i) => (
                    <Tag
                      key={i}
                      value={item.meta.ZUID}
                      link={`//${CONFIG.MANAGER_URL}/#!/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                      onRemove={this.onRemove}
                    >
                      {item.data[relatedField.name]}
                    </Tag>
                  ))}
            </span>
          );
        } else {
          // Otherwise the field is probably being loaded?
          return (
            <span
              className={cx(
                this.props.className,
                styles.OneToManyCell,
                styles.ErrorCell
              )}
            >
              <Loader />
            </span>
          );
        }
      }
    }
  }
}
