import React from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faComment,
  faQuestion,
  faEye
} from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";
import { GlobalNotifications } from "./components/global-notifications";

import styles from "./styles.less";
import CONFIG from "../../app.config";
export default connect(state => {
  return {
    instance: state.instance,
    content: state.content
  };
})(
  React.memo(function GlobalActions(props) {
    return (
      <div className={styles.GlobalSubMenu}>
        <div className={styles.GlobalActions}>
          <LivePreview
            instanceHash={props.instance.randomHashID}
            instanceZUID={props.instance.ZUID}
            content={props.content}
          />
          {/* <span className={styles.action} title="Notifications">
            <FontAwesomeIcon icon={faBell} />
          </span> */}

          <GlobalNotifications className={styles.action} />

          {/* <span className={styles.action} title="Chat">
            <FontAwesomeIcon icon={faComment} />
          </span> */}
          <span className={styles.action} title="Help">
            <FontAwesomeIcon icon={faQuestion} />
          </span>
        </div>

        <span className={cx(styles.AppVersion)}>
          <img
            src="https://brand.zesty.io/zesty-io-logo.svg"
            alt={`Zesty.io version ${CONFIG.VERSION}`}
            width="24px"
            height="24px"
          />
          <span className={styles.VersionNumber}>{CONFIG.VERSION}</span>
        </span>
      </div>
    );
  })
);

function LivePreview(props) {
  return (
    <span className={styles.action} title="Live Preview">
      <FontAwesomeIcon
        onClick={() =>
          openLivePreview(props.instanceZUID, props.instanceHash, props.content)
        }
        icon={faEye}
      />
    </span>
  );
}

function openLivePreview(instanceZUID, instanceHash, content) {
  const origin = `${CONFIG.URL_MANAGER_PROTOCOL}${instanceZUID}${CONFIG.URL_MANAGER}`;
  const previewDomain = `${CONFIG.URL_PREVIEW_PROTOCOL}${instanceHash}${CONFIG.URL_PREVIEW}`;

  const preview = window.open(
    origin + "/livePreview.html",
    "Active Preview",
    "height=850, width=1400, location=0, menubar=0, status=0, titlebar=0, toolbar=0"
  );

  zesty.on("UPDATED_CONTENT_ITEM", function(itemZUID) {
    preview.postMessage(
      {
        type: "UPDATED_CONTENT_ITEM",
        itemZUID
      },
      origin
    );
  });

  zesty.on("FORCE_PREVIEW_RERENDER", function(itemZUID) {
    preview.postMessage(
      {
        type: "FORCE_RERENDER"
      },
      origin
    );
  });

  const activePreviewRoute = setActivePreviewRoute.bind(
    null,
    preview,
    previewDomain,
    origin,
    content
  );

  // Setup initial preview
  preview.addEventListener("load", activePreviewRoute);
  preview.addEventListener("beforeunload", function(evt) {
    zesty.off("UPDATED_CONTENT_ITEM");
    zesty.off("FORCE_PREVIEW_RERENDER");
    zesty.off("locationChange");
    window.removeEventListener("beforeunload", closeActivePreview, false);
  });

  zesty.on("locationChange", activePreviewRoute);
  window.addEventListener(
    "beforeunload",
    closeActivePreview.bind(null, preview)
  );
}

function closeActivePreview(preview) {
  preview.close();
}

function setActivePreviewRoute(preview, previewDomain, origin, content) {
  if (window.location.pathname.slice(0, 9) === "/content/") {
    const data = {
      type: "RENDER_CONTENT_ITEM",
      domain: previewDomain
    };
    const parts = window.location.pathname.split("/");
    const itemZUID = parts.pop();

    // Resolve the current items path
    if (itemZUID.slice(0, 1) === "7") {
      const item = content[itemZUID];

      if (item && item.web && item.web.path) {
        data.route = item.web.path;
        data.itemZUID = item.meta.ZUID;
      }
      preview.postMessage(data, origin);
    }
  }
}
