import React, { PureComponent } from "react";

import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";

import { AppLink } from "@zesty-io/core/AppLink";
import { Field } from "./Field";

import styles from "./Editor.less";
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      firstTextField: this.props.fields.find(
        field => field.datatype === "text"
      ),
      firstContentField: this.props.fields.find(
        field =>
          field.datatype === "textarea" ||
          field.datatype === "article_writer" ||
          field.datatype === "markdown" ||
          field.datatype.includes("wysiwyg")
      )
    };
  }

  componentDidUpdate() {
    if (this.props.active) {
      this.scrollToField(this.props.active);
    }
  }

  scrollToField = fieldZUID => {
    const node = document.getElementById(fieldZUID);
    if (node) {
      node.scrollIntoView({ behavior: "auto", block: "start" });
      node.querySelector("input") && node.querySelector("input").focus();

      //reset the active prop from the parent
      this.props.scrolled();
    }
  };

  onChange = (value, name) => {
    if (!name) {
      throw new Error("Input is missing name attribute");
    }

    // Always dispatch the data update
    this.props.dispatch({
      type: "SET_ITEM_DATA",
      itemZUID: this.props.itemZUID,
      key: name,
      value: value
    });

    // If we are working with a new item
    if (this.props.itemZUID.slice(0, 3) === "new") {
      if (
        this.state.firstTextField &&
        this.state.firstTextField.name === name
      ) {
        this.props.dispatch({
          type: "SET_ITEM_WEB",
          itemZUID: this.props.itemZUID,
          key: "metaLinkText",
          value: value
        });
        this.props.dispatch({
          type: "SET_ITEM_WEB",
          itemZUID: this.props.itemZUID,
          key: "metaTitle",
          value: value
        });

        // Datasets do not get path parts
        if (this.props.model.type !== "dataset") {
          this.props.dispatch({
            type: "SET_ITEM_WEB",
            itemZUID: this.props.itemZUID,
            key: "pathPart",
            value: value
              .trim()
              .toLowerCase()
              .replace(/\&/g, "and")
              .replace(/[^a-zA-Z0-9]/g, "-")
          });
        }
      }

      if (
        this.state.firstContentField &&
        this.state.firstContentField.name === name
      ) {
        this.props.dispatch({
          type: "SET_ITEM_WEB",
          itemZUID: this.props.itemZUID,
          key: "metaDescription",
          value: value.replace(/<[^>]*>/g, "").slice(0, 160)
        });
      }
    }
  };

  render() {
    const { item, active, model, fields, onSave } = this.props;
    return (
      <div className={styles.Fields}>
        {this.props.item.meta && this.props.item.meta.ZUID && (
          <Breadcrumbs itemZUID={this.props.item.meta.ZUID} />
        )}

        {fields.length ? (
          fields
            .filter(field => !field.deletedAt)
            .map(field => {
              return (
                <div
                  key={`${field.ZUID}`}
                  id={field.ZUID}
                  className={styles.Field}
                >
                  <Field
                    ZUID={field.ZUID}
                    contentModelZUID={field.contentModelZUID}
                    active={active === field.ZUID}
                    name={field.name}
                    label={field.label}
                    description={field.description}
                    required={field.required}
                    relatedFieldZUID={field.relatedFieldZUID}
                    relatedModelZUID={field.relatedModelZUID}
                    datatype={field.datatype}
                    options={field.options}
                    settings={field.settings}
                    onChange={this.onChange}
                    onSave={onSave}
                    value={item && item.data && item.data[field.name]}
                    langID={item?.meta?.langID}
                  />
                </div>
              );
            })
        ) : (
          <div className={styles.NoFields}>
            <h1 className={styles.Display}>No fields have been added</h1>
            <h2 className={styles.SubHead}>
              Use the{" "}
              <AppLink to={`/schema/${model.ZUID}`}>Schema Builder</AppLink> to
              define your items content
            </h2>
          </div>
        )}
      </div>
    );
  }
}
