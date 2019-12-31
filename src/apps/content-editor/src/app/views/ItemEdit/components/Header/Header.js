import React from "react";

import { Breadcrumbs } from "./Breadcrumbs";
import { ItemNavigation } from "./ItemNavigation";
import { LanguageSelector } from "./LanguageSelector";

import styles from "./Header.less";
export class Header extends React.PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <div className={styles.ItemNav}>
          <menu className={styles.Path}>
            <Breadcrumbs itemZUID={this.props.itemZUID} />
          </menu>
          <ItemNavigation
            modelZUID={this.props.modelZUID}
            itemZUID={this.props.itemZUID}
            item={this.props.item}
          />
        </div>
        <LanguageSelector
          className={styles.I18N}
          itemZUID={this.props.itemZUID}
        />
      </header>
    );
  }
}
