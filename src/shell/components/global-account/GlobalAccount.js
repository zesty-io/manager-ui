import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { toggleAccountsMenu } from "shell/store/ui/global-accounts-menu";
import { subMenuLoad } from "shell/store/ui/global-sub-menu";

import css from "./GlobalAccount.less";
export default React.memo(function GlobalAccount(props) {
  return (
    <div
      className={css.GlobalAccount}
      onMouseEnter={() => {
        props.dispatch(subMenuLoad(""));
        props.dispatch(toggleAccountsMenu(true));
      }}
      onMouseLeave={() => {
        props.dispatch(toggleAccountsMenu(false));
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
    </div>
  );
});
