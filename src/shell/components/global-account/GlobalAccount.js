import React from "react";
import { useDispatch } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { toggleAccountsMenu } from "shell/store/ui/global-accounts-menu";
import { subMenuLoad } from "shell/store/ui/global-sub-menu";

import css from "./GlobalAccount.less";
export default React.memo(function GlobalAccount(props) {
  const dispatch = useDispatch();

  return (
    <div
      className={css.GlobalAccount}
      onMouseEnter={() => {
        dispatch(subMenuLoad(""));
        dispatch(toggleAccountsMenu(true));
      }}
      onMouseLeave={() => {
        dispatch(toggleAccountsMenu(false));
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
    </div>
  );
});
