import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import GlobalAccountMenu from "shell/components/global-account-menu";

import css from "./GlobalAccount.less";

export default function GlobalAccount(props) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div
      className={css.GlobalAccount}
      onMouseEnter={() => {
        setOpenMenu(true);
      }}
      onMouseLeave={() => {
        setOpenMenu(false);
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
      {openMenu && <GlobalAccountMenu />}
    </div>
  );
}
