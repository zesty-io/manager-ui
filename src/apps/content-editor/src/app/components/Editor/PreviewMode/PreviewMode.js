import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import styles from "./PreviewMode.less";
import { theme } from "@zesty-io/material";
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

  // Sends message to preview window to update route
  function route(itemZUID, version, dirty, hasErrors) {
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
            dirty: dirty,
            hasErrors,
          },
          origin
        );
      }
    }
  }

  useEffect(() => {
    if (preview.current) {
      // ActivePreview iframe is loading, send route when ready
      preview.current.addEventListener("load", () => {
        route(props.itemZUID, props.version, props.dirty, props.hasErrors);
      });

      // ActivePreview iframe is loaded, send route updates
      const doc =
        preview.current.contentDocument ||
        preview.current.contentWindow.document;
      if (doc.readyState === "complete") {
        route(props.itemZUID, props.version, props.dirty, props.hasErrors);
      }
    }
  }, [props.itemZUID, props.version, props.dirty, props.hasErrors]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.source === "zesty") {
        switch (event.data.action) {
          case "close":
            props.onClose();
            break;
          case "save":
            props.onSave();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    // <div data-cy="DuoModeContainer" className={styles.DMContainer}>
    <ThemeProvider theme={theme}>
      <Box
        height="100%"
        width="100%"
        sx={{
          border: (theme) => `1px solid ${theme.palette.border}`,
          borderRadius: "8px",
        }}
        component="iframe"
        ref={preview}
        src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        // src={`https://${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        frameBorder="0"
      ></Box>
    </ThemeProvider>
    // </div>
  );
}
