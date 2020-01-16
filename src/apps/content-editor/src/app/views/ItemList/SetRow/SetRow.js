import React, { Component, PureComponent } from "react";
import cx from "classnames";

import { Url } from "@zesty-io/core/Url";

import { DateCell } from "./DateCell";
import { ImageCell } from "./ImageCell";
import { FileCell } from "./FileCell";
import { LinkCell } from "./LinkCell";
import { SortCell } from "./SortCell";
import { TextCell } from "./TextCell";
import { WYSIWYGcell } from "./WYSIWYGcell";
import { ToggleCell } from "./ToggleCell";
import { ColorCell } from "./ColorCell";
import { OneToOneCell } from "./OneToOneCell";
import { OneToManyCell } from "./OneToManyCell";
import { DropdownCell } from "./DropdownCell";
import { InternalLinkCell } from "./InternalLinkCell";
import { PublishStatusCell } from "./PublishStatusCell";

import styles from "./SetRow.less";
export class SetRow extends Component {
  state = {
    loaded: false
  };

  selectRow = (name, value) => {
    if (name && typeof value != "undefined") {
      // this.props.onChange(this.props.itemZUID, name, value);
    } else {
      if (this.props.itemZUID.slice(0, 3) === "new") {
        window.location = `/content/${this.props.modelZUID}/new`;
      } else {
        window.location = `/content/${this.props.modelZUID}/${this.props.itemZUID}`;
      }
    }
  };

  componentDidMount() {
    // TODO: Replace individual row lookup with instance level publishing records
    // const item = this.props.allItems[this.props.itemZUID];
    // if (item && !item.publishing) {
    //   this.props.loadItemPublishData(this.props.modelZUID, this.props.itemZUID);
    // }
  }

  render() {
    const item = this.props.allItems[this.props.itemZUID];

    return (
      <article
        className={cx(styles.SetRow, this.props.isDirty && styles.Dirty)}
        style={{ ...this.props.style }}
      >
        <PublishStatusCell type={this.props.model.type} item={item} />
        <div
          className={styles.Cells}
          onClick={() => {
            this.selectRow();
          }}
        >
          {this.props.fields.map(field => {
            switch (field.datatype) {
              case "one_to_one":
                return (
                  <OneToOneCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    field={field}
                    loadItem={this.props.loadItem}
                    value={this.props.data[field.name]}
                    allItems={this.props.allItems}
                    allFields={this.props.allFields}
                  />
                );
                break;

              case "one_to_many":
                return (
                  <OneToManyCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    onRemove={(name, value) => {
                      return this.props.onChange(
                        this.props.itemZUID,
                        name,
                        value
                      );
                    }}
                    value={this.props.data[field.name] || ""}
                    name={field.name}
                    field={field}
                    settings={field.settings}
                    allItems={this.props.allItems}
                    allFields={this.props.allFields}
                  />
                );
                break;

              case "dropdown":
                return (
                  <DropdownCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    field={field}
                    value={this.props.data[field.name]}
                  />
                );
                break;

              case "internal_link":
                return (
                  <InternalLinkCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    field={field}
                    relatedItemZUID={this.props.data[field.name]}
                    allItems={this.props.allItems}
                    searchItem={this.props.searchItem}
                  />
                );

              case "wysiwyg_advanced":
              case "wysiwyg_basic":
              case "article_writer":
              case "markdown":
                return (
                  <div
                    className={styles.Cell}
                    key={field.name + this.props.itemZUID}
                  >
                    <WYSIWYGcell value={this.props.data[field.name]} />
                  </div>
                );
                break;

              case "text":
              case "textarea":
              case "uuid":
                return (
                  <div
                    className={styles.Cell}
                    key={field.name + this.props.itemZUID}
                  >
                    <TextCell value={this.props.data[field.name]} />
                  </div>
                );
                break;

              case "files":
                return (
                  <FileCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    data={this.props.data[field.name]}
                  />
                );
                break;

              case "images":
                return (
                  <ImageCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    value={this.props.data[field.name]}
                  />
                );
                break;

              case "yes_no":
                return (
                  <ToggleCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    name={field.name}
                    field={field}
                    value={this.props.data[field.name]}
                    onChange={(name, value) =>
                      this.props.onChange(this.props.itemZUID, name, value)
                    }
                  />
                );
                break;

              case "color":
                return (
                  <ColorCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    value={this.props.data[field.name]}
                  />
                );
                break;

              case "sort":
                return (
                  <SortCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    name={field.name}
                    value={this.props.data[field.name]}
                    onChange={(name, value) => {
                      return this.props.onChange(
                        this.props.itemZUID,
                        name,
                        value
                      );
                    }}
                  />
                );
                break;

              case "link":
                return (
                  <LinkCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    value={this.props.data[field.name]}
                  />
                );
                break;

              case "date":
              case "datetime":
                return (
                  <DateCell
                    key={field.name + this.props.itemZUID}
                    className={styles.Cell}
                    value={this.props.data[field.name]}
                  />
                );
                break;

              default:
                return (
                  <span
                    key={field.name + this.props.itemZUID}
                    className={cx(styles.Cell, styles.DefaultCell)}
                  >
                    {this.props.data[field.name]}
                  </span>
                );
                break;
            }
          })}
        </div>
      </article>
    );
  }
}
