import React from "react";
import cx from "classnames";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
// import { PublishStatus } from "./PublishStatus";
import { LanguageSelector } from "./LanguageSelector";

import ItemNavigation from "./ItemNavigation";

import styles from "./Header.less";
export class Header extends React.PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <div className={cx(styles.Split)}>
          <div className={styles.Left}>
            <ItemNavigation
              modelZUID={this.props.modelZUID}
              itemZUID={this.props.itemZUID}
              item={this.props.item}
            />
          </div>
          <div className={styles.Right}>
            <div className={styles.Links}>
              {this.props.item.web.path && (
                <LiveUrl
                  item={this.props.item}
                  instance={this.props.instance}
                />
              )}

              {this.props.item.web.path && (
                <PreviewUrl
                  item={this.props.item}
                  instance={this.props.instance}
                />
              )}
            </div>

            <div className={styles.Actions}>
              <LanguageSelector
                className={styles.I18N}
                itemZUID={this.props.itemZUID}
              />
              {this.props.children}
            </div>
          </div>
        </div>
      </header>
    );
  }
}
