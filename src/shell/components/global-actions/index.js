import { memo, useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";
import cx from "classnames";

import { useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faHashtag } from "@fortawesome/free-solid-svg-icons";

import Link from "@mui/material/Link";

import GlobalHelpMenu from "shell/components/GlobalHelpMenu";

import styles from "./styles.less";
export default memo(function GlobalActions(props) {
  const openNav = useSelector((state) => state.ui.openNav);
  const [openMenu, setOpenMenu] = useState(false);

  const ref = useOnclickOutside(() => {
    setOpenMenu(false);
  });

  return (
    <div className={cx(styles.GlobalSubMenu, openNav ? styles.NavOpen : null)}>
      <div className={styles.GlobalActions}>
        <span
          ref={ref}
          onClick={() => setOpenMenu(!openMenu)}
          className={styles.GlobalAction}
          title="Help"
        >
          <FontAwesomeIcon icon={faBook} className={styles.GlobalActionIcon} />
          {openMenu && <GlobalHelpMenu />}
          {openNav && <span>Docs</span>}
        </span>

        <Link
          underline="none"
          color="secondary"
          href={`https://zesty.io`}
          title="Zesty.io"
          target="_blank"
          // TODO: Fix these styles
          className={styles.GlobalAction}
        >
          <img
            src="https://brand.zesty.io/zesty-io-logo.svg"
            alt="Zesty.io"
            width="16px"
            height="16px"
          />
          {openNav && <span className={styles.GlobalAction}>Zesty.io</span>}
        </Link>

        <div className={styles.AppVersion}>
          <Link
            underline="none"
            color="secondary"
            href={`https://github.com/zesty-io/manager-ui/commit/${CONFIG?.build?.data?.gitCommit}`}
            title="View source code commit"
            target="_blank"
          >
            {openNav && <FontAwesomeIcon icon={faHashtag} />}
            <span className={styles.VersionNumber}>
              {CONFIG?.build?.data?.gitCommit}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
});
