import React from "react";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
import { PublishStatus } from "./PublishStatus";
import { LanguageSelector } from "./LanguageSelector";
import ItemNavigation from "./ItemNavigation";

import styles from "./Header.less";
export class Header extends React.PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <PublishStatus item={this.props.item} instance={this.props.instance} />

        {this.props.item.web.path && (
          <LiveUrl item={this.props.item} instance={this.props.instance} />
        )}

        {this.props.item.web.path && (
          <PreviewUrl item={this.props.item} instance={this.props.instance} />
        )}

        <LanguageSelector
          className={styles.I18N}
          itemZUID={this.props.itemZUID}
        />

        <div className={styles.Actions}>{this.props.children}</div>

        <div className={styles.ItemNav}>
          <ItemNavigation
            modelZUID={this.props.modelZUID}
            itemZUID={this.props.itemZUID}
            item={this.props.item}
          />
        </div>
      </header>
    );
  }
}
