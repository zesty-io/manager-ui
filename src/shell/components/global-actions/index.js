import React, { useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";

import GlobalHelpMenu from "shell/components/GlobalHelpMenu";
import { ActivePreview } from "./components/ActivePreview";

import styles from "./styles.less";
export default React.memo(function GlobalActions(props) {
  const [openMenu, setOpenMenu] = useState(false);

  const ref = useOnclickOutside(() => {
    setOpenMenu(false);
  });

  return (
    <div className={styles.GlobalSubMenu}>
      <div className={styles.GlobalActions}>
        <span className={styles.GlobalAction}>
          <ActivePreview className={styles.GlobalActionIcon} />
        </span>

        <span
          ref={ref}
          onClick={() => setOpenMenu(!openMenu)}
          className={styles.GlobalAction}
          title="Help"
        >
          <FontAwesomeIcon
            icon={faQuestion}
            className={styles.GlobalActionIcon}
          />
          {openMenu && <GlobalHelpMenu />}
        </span>
      </div>
      <div className={styles.AppVersion}>
        <Url
          href={`https://github.com/zesty-io/manager-ui/commit/${CONFIG?.build?.data?.gitCommit}`}
          title="View source code commit"
          target="_blank"
        >
          <img
            src="https://brand.zesty.io/zesty-io-logo.svg"
            alt={`Zesty.io version ${CONFIG?.build?.data?.gitCommit}`}
            width="24px"
            height="24px"
          />
          <span className={styles.VersionNumber}>
            {CONFIG?.build?.data?.gitCommit}
          </span>
        </Url>
      </div>
    </div>
  );
});
