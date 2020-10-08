import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";
import { ItemUrl } from "../Header/LiveUrl";

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
        </div>
        <div className={styles.Actions}>{this.props.children}</div>
      </header>
    );
  }
}
