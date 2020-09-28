import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import GlobalAccountMenu from "shell/components/global-account-menu";

import css from "./GlobalAccount.less";
export default function GlobalAccount() {
  const [openMenu, setOpenMenu] = useState(false);
  const [token, setToken] = useState(false);

  return (
    <div
      className={css.GlobalAccount}
      onMouseEnter={() => {
        if (token) {
          clearTimeout(token);
        }
        setOpenMenu(true);
      }}
      onMouseLeave={() => {
        setToken(setTimeout(() => setOpenMenu(false), 500));
      }}
    >
      <FontAwesomeIcon icon={faGlobe} />
      <GlobalAccountMenu display={openMenu} />
    </div>
  );
}
