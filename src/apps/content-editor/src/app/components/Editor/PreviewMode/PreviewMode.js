import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Notice } from "@zesty-io/core/Notice";

import styles from "./PreviewMode.less";
export default function PreviewMode(props) {
  const origin = window.location.origin;

  const instance = useSelector((state) => state.instance);
  const content = useSelector((state) => state.content);
  const instanceSettings = useSelector((state) => state.settings.instance);
  const previewLock = useSelector((state) =>
    state.settings.instance.find(
      (setting) => setting.key === "preview_lock_password" && setting.value
    )
  );

  const preview = useRef(null);

  // Track initial version provided. We use this to make a determination
  // on whether current content has changed or the different version was
  // picked for previewing
  const [initialVersion] = useState(props.version);

  // Sends message to preview window to update route
  function route(itemZUID, version) {
    if (preview.current) {
      // if not a string or a string that is not a content item zuid
      // then see if location contains a routable content item
      // only 7- resources are capable of having a path
      if (typeof itemZUID !== "string" || itemZUID.slice(0, 2) !== "7-") {
        itemZUID = location.pathname
          .split("/")
          .find((part) => part.slice(0, 2) === "7-");
      }

      if (itemZUID) {
        const item = content[itemZUID];

        let url = item?.web?.path
          ? `${item.web.path}`
          : `/-/instant/${item.meta.ZUID}.json`;

        url = `${url}?_bypassError=true&__version=${props.version}`;

        if (previewLock) {
          url = `${url}&zpw=${previewLock.value}`;
        }

        preview.current.contentWindow.postMessage(
          {
            source: "zesty",
            route: url,
            settings: instanceSettings,
            version: version,
          },
          origin
        );
      }
    }
  }

  useEffect(() => {
    if (preview.current) {
      // Send initial route on open
      preview.current.addEventListener("load", () =>
        route(props.itemZUID, props.version)
      );

      // If the ActivePreview is loaded and we need to send route updates
      const doc =
        preview.current.contentDocument ||
        preview.current.contentWindow.document;
      if (doc.readyState === "complete") {
        route(props.itemZUID, props.version);
      }
    }
  }, [props.itemZUID, props.version]);

  return (
    <div data-cy="DuoModeContainer" className={styles.DMContainer}>
      {initialVersion === props.version && props.dirty && (
        <div className={styles.Overlay}>
          <Notice>Save to update preview</Notice>
        </div>
      )}
      <iframe
        className={
          initialVersion === props.version && props.dirty ? styles.Blur : null
        }
        ref={preview}
        src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        frameBorder="0"
      ></iframe>
    </div>
  );
}
