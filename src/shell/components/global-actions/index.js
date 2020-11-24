import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import useOnclickOutside from "react-cool-onclickoutside";

import { Url } from "@zesty-io/core/Url";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faEye } from "@fortawesome/free-solid-svg-icons";

import GlobalHelpMenu from "shell/components/GlobalHelpMenu";
import { GlobalNotifications } from "./components/global-notifications";

import styles from "./styles.less";
export default connect(state => {
  return {
    instance: state.instance,
    content: state.content
  };
})(
  React.memo(function GlobalActions(props) {
    const [openMenu, setOpenMenu] = useState(false);
    const ref = useOnclickOutside(() => {
      setOpenMenu(false);
    });
    return (
      <div className={styles.GlobalSubMenu}>
        <div className={styles.GlobalActions}>
          <ActivePreview
            instanceHash={props.instance.randomHashID}
            instanceZUID={props.instance.ZUID}
            content={props.content}
          />

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
        <div className={styles.ZestyLink}>
          <Url
            className={cx(styles.AppVersion)}
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
      </div>
    );
  })
);

function ActivePreview(props) {
  return (
    <span className={styles.GlobalAction} title="Active Preview">
      <FontAwesomeIcon
        onClick={() =>
          openActivePreview(
            props.instanceZUID,
            props.instanceHash,
            props.content
          )
        }
        icon={faEye}
        className={styles.GlobalActionIcon}
      />
    </span>
  );
}

function openActivePreview(instanceZUID, instanceHash, content) {
  const origin = `${CONFIG.URL_MANAGER_PROTOCOL}${instanceZUID}${CONFIG.URL_MANAGER}`;

  const preview = window.open(
    origin + "/active-preview/",
    "Active Preview",
    "height=850, width=1400, location=0, menubar=0, status=0, titlebar=0, toolbar=0"
  );

  const closeActivePreview = () => preview.close();

  const routeActivePreview = itemZUID => {
    if (!itemZUID) {
      // Check if current location has a routable item
      const parts = window.location.pathname.split("/");
      itemZUID = parts.find(part => part.slice(0, 1) === "7-");
    }

    if (itemZUID && content[itemZUID]) {
      const item = content[itemZUID];

      if (item.web.path) {
        preview.postMessage(
          {
            source: "zesty",
            route: item.web.path
          },
          origin
        );
      }
    }
  };

  /**
   * This is the key to "active" preview
   * as a user navigates around the manager app
   * we check if the view they are on contains a routable ZUID
   */
  zesty.on("locationChange", routeActivePreview);
  zesty.on("UPDATED_CONTENT_ITEM", itemZUID => routeActivePreview(itemZUID));
  zesty.on("FORCE_PREVIEW_RERENDER", itemZUID => routeActivePreview(itemZUID));

  // If instance manager is closed then close active preview
  window.addEventListener("beforeunload", closeActivePreview);

  // Send initial route on open
  preview.addEventListener("load", routeActivePreview);

  // if active preview is closed detach event listeners to avoid memory leak
  preview.addEventListener("beforeunload", function(evt) {
    zesty.off("locationChange");
    zesty.off("UPDATED_CONTENT_ITEM");
    zesty.off("FORCE_PREVIEW_RERENDER");
    window.removeEventListener("beforeunload", closeActivePreview);
  });
}
