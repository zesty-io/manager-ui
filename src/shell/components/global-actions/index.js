import React, { useState } from "react";
import cx from "classnames";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDungeon, faQuestion } from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";

import GlobalHelpMenu from "shell/components/GlobalHelpMenu";
import { GlobalNotifications } from "./components/global-notifications";
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

        <span className={styles.GlobalAction}>
          <GlobalNotifications className={styles.GlobalActionIcon} />
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
          href="https://github.com/zesty-io/manager-ui"
          title="Zesty Manager-ui Github"
          target="_blank"
        >
          <img
            src="https://brand.zesty.io/zesty-io-logo.svg"
            alt={`Zesty.io version ${CONFIG.VERSION}`}
            width="24px"
            height="24px"
          />
        </Url>
        <span className={styles.VersionNumber}>{CONFIG.VERSION}</span>
      </div>
      <div className={styles.Legacy}>
        <Url href={`https://${props.hash}.manage.zesty.io/`}>
          <Button>
            <FontAwesomeIcon icon={faDungeon} />
            <span className={styles.hide}>Legacy</span>
          </Button>
        </Url>
      </div>
    </div>
  );
});
