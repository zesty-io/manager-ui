import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";
import { ItemUrl } from "./ItemUrl";

import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";

import styles from "./SubHeader.less";
export class SubHeader extends Component {
  render() {
    return (
      <header className={styles.SubHeader}>
        <div className={styles.Path}>
          {this.props.item.meta.ZUID && (
            <Breadcrumbs itemZUID={this.props.item.meta.ZUID} />
          )}

          {this.props.item.web.path && (
            <div className={styles.Preview}>
              <Url
                className={styles.PreviewUrl}
                target="_blank"
                title={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}${this.props.item.web.path}`}
                href={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}${this.props.item.web.path}?__version=${this.props.item.meta.version}`}
              >
                <FontAwesomeIcon icon={faEye} /> Preview Current Version - 10
              </Url>

              {this.props.item.web.path &&
                (this.props.instance.domain ? (
                  <ItemUrl
                    item={this.props.item}
                    instance={this.props.instance}
                  />
                ) : (
                  <Url
                    target="_blank"
                    href={`${CONFIG.URL_ACCOUNTS}/instances/${this.props.modelZUID}/launch`}
                  >
                    <FontAwesomeIcon icon={faRocket} />
                    &nbsp;Launch Instance
                  </Url>
                ))}
            </div>
          )}
        </div>
        <div className={styles.Actions}>{this.props.children}</div>
      </header>
    );
  }
}
