import React from "react";
import cx from "classnames";

import { MetaTitle } from "./settings/MetaTitle";
import MetaDescription from "./settings/MetaDescription";
import { MetaKeywords } from "./settings/MetaKeywords";
import { MetaLinkText } from "./settings/MetaLinkText";

import styles from "./ItemSettings.less";
export class DataSettings extends React.Component {
  onChange = (value, name) => {
    if (!name) {
      throw new Error("Input is missing name attribute");
    }
    this.props.dispatch({
      type: "SET_ITEM_WEB",
      itemZUID: this.props.item.meta.ZUID,
      key: name,
      value: value
    });
  };

  render() {
    let web = this.props.item.web || {};
    return (
      <section className={styles.Meta}>
        <div className={cx(styles.Settings, styles.DataSettings)}>
          <MetaLinkText
            meta_link_text={web.metaLinkText}
            onChange={this.onChange}
          />
          <MetaTitle meta_title={web.metaTitle} onChange={this.onChange} />
          <MetaDescription
            meta_description={web.metaDescription}
            onChange={this.onChange}
          />
          <MetaKeywords
            meta_keywords={web.metaKeywords}
            onChange={this.onChange}
          />
        </div>
      </section>
    );
  }
}
