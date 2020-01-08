import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { toggleAccountsMenu } from "shell/store/ui/global-accounts-menu";
import { subMenuLoad } from "shell/store/ui/global-sub-menu";

import css from "./GlobalAccount.less";
export default class GlobalAccount extends Component {
  constructor(props) {
    super(props);
    this.showAccountsMenu = this.showAccountsMenu.bind(this);
    this.hideAccountsMenu = this.hideAccountsMenu.bind(this);
  }
  render() {
    return (
      <div
        className={css.GlobalAccount}
        onMouseEnter={this.showAccountsMenu}
        onMouseLeave={this.hideAccountsMenu}
      >
        {/* <i className="fa fa-globe" aria-hidden="true"></i> */}
        <FontAwesomeIcon icon={faGlobe} />
      </div>
    );
  }
  showAccountsMenu() {
    this.props.dispatch(subMenuLoad(""));
    this.props.dispatch(toggleAccountsMenu(true));
  }
  hideAccountsMenu() {
    this.props.dispatch(toggleAccountsMenu(false));
  }
}
