import React, { useEffect, useRef } from "react";
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

  function refresh() {
    if (preview.current) {
      preview.current.contentWindow.postMessage(
        {
          source: "zesty",
          refresh: true,
        },
        origin
      );
    }
  }

  // Sends message to preview window to update route
  function route(itemZUID) {
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
            version: props.version,
          },
          origin
        );
      }
    }
  }

  useEffect(() => {
    if (preview.current) {
      // Send initial route on open
      preview.current.addEventListener("load", () => route());
    }

    zesty.on("PREVIEW_ROUTE", route);
    zesty.on("PREVIEW_REFRESH", refresh);

    return () => {
      zesty.off("PREVIEW_ROUTE");
      zesty.off("PREVIEW_REFRESH");
    };
  }, []);

  return (
    <div data-cy="DuoModeContainer" className={styles.DMContainer}>
      {props.dirty && (
        <div className={styles.Overlay}>
          <Notice>Save to update preview</Notice>
        </div>
      )}
      <iframe
        className={props.dirty ? styles.Blur : ""}
        ref={preview}
        src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        frameBorder="0"
      ></iframe>
    </div>
  );
}
