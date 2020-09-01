import React from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { toggleAccountsMenu } from "shell/store/ui/global-accounts-menu";

import css from "./GlobalAccount.less";
export default connect(state => {
  return {
    ui: state.ui
  };
})(function GlobalAccount(props) {
  return (
    <div
      className={css.GlobalAccount}
      onClick={() => {
        props.dispatch(toggleAccountsMenu(!props.ui.accountsMenuVisible));
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
    </div>
  );
});
