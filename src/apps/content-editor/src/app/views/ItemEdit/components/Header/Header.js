import React from "react";
import cx from "classnames";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
import { PublishStatus } from "./PublishStatus";
import { LanguageSelector } from "./LanguageSelector";

import ItemNavigation from "./ItemNavigation";
import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";

import styles from "./Header.less";
export class Header extends React.PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <div className={cx(styles.Split, styles.Top)}>
          <div className={styles.Left}>
            <div className={styles.ItemNav}>
              <ItemNavigation
                modelZUID={this.props.modelZUID}
                itemZUID={this.props.itemZUID}
                item={this.props.item}
              />
            </div>
          </div>
          <div className={styles.Right}>
            <div className={styles.Links}>
              {/* <PublishStatus
              item={this.props.item}
              instance={this.props.instance}
            /> */}

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

            <div className={styles.Actions}>{this.props.children}</div>
          </div>
        </div>

        {/* <div className={cx(styles.Split)}>
          {this.props.item.meta.ZUID && (
            <Breadcrumbs itemZUID={this.props.item.meta.ZUID} />
          )}
        </div> */}

        {/* <div className={styles.Split}>
          <div className={styles.Left}>
            <div className={styles.ItemNav}>
              <ItemNavigation
                modelZUID={this.props.modelZUID}
                itemZUID={this.props.itemZUID}
                item={this.props.item}
              />
            </div>
          </div>
          <div className={styles.Right}>
            {this.props.item.meta.ZUID && (
              <Breadcrumbs itemZUID={this.props.item.meta.ZUID} />
            )}
          </div>
        </div> */}

        {/* <LanguageSelector
          className={styles.I18N}
          itemZUID={this.props.itemZUID}
        /> */}
      </header>
    );
  }
}
