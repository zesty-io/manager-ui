import React, { useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import GlobalAccountMenu from "shell/components/global-account-menu";

import css from "./GlobalAccount.less";

export default function GlobalAccount(props) {
  const [openMenu, setOpenMenu] = useState(false);
  const ref = useOnclickOutside(() => {
    setOpenMenu(false);
  });

  return (
    <div
      ref={ref}
      className={css.GlobalAccount}
      onClick={() => {
        setOpenMenu(!openMenu);
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
      {openMenu && <GlobalAccountMenu />}
    </div>
  );
}
