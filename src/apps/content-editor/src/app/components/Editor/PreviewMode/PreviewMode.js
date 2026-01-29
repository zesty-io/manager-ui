import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

export default function PreviewMode(props) {
  const origin = window.location.origin;
  const preview = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const instance = useSelector((state) => state.instance);
  const content = useSelector((state) => state.content);
  const instanceSettings = useSelector((state) => state.settings.instance);
  const previewLock = useSelector((state) =>
    state.settings.instance.find(
      (setting) => setting.key === "preview_lock_password" && setting.value
    )
  );
  // Sends message to preview window to update route
  const route = useCallback(
    (itemZUID, version, dirty, hasErrors, model) => {
      if (!preview.current) return;
      // if not a string or a string that is not a content item zuid
      // then see if location contains a routable content item
      // only 7- resources are capable of having a path
      if (typeof itemZUID !== "string" || itemZUID.slice(0, 2) !== "7-") {
        itemZUID = location.pathname
          .split("/")
          .find((part) => part.slice(0, 2) === "7-");
      }
      if (!itemZUID) return;

      const item = content[itemZUID];
      const previewUrl = `${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`;

      let url = "";

      if (model?.type === "block") {
        url = `/-/block/${model.name}.html?variant=${item?.meta?.ZUID}&version=${version}&preview=global`;
      } else {
        url = item?.web?.path
          ? item.web.path
          : `/-/instant/${item?.meta?.ZUID}.json`;
        url += `?_bypassError=true&__version=${version}`;
      }

      if (previewLock) {
        url += `&zpw=${previewLock.value}`;
      }

      preview.current.contentWindow.postMessage(
        {
          source: "zesty",
          previewUrl,
          route: url,
          settings: instanceSettings,
          version,
          dirty,
          hasErrors,
        },
        origin
      );
    },
    [content, instance, instanceSettings, previewLock, origin]
  );

  // On iframe load, set isLoaded and send initial route message
  useEffect(() => {
    const iframe = preview?.current;
    if (!iframe) return;

    const onLoad = () => {
      route(
        props.itemZUID,
        props.version,
        props.dirty,
        props.hasErrors,
        props.model
      );
      setIsLoaded(true);
    };

    iframe.addEventListener("load", onLoad);

    // If iframe already loaded, trigger immediately
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc?.readyState === "complete") {
      onLoad();
    }

    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, [
    props.itemZUID,
    props.version,
    props.dirty,
    props.hasErrors,
    props.model,
    preview?.current,
    route,
  ]);

  // On prop changes or isLoaded, update route
  useEffect(() => {
    if (isLoaded) {
      route(
        props.itemZUID,
        props.version,
        props.dirty,
        props.hasErrors,
        props.model
      );
    }
  }, [
    props.itemZUID,
    props.version,
    props.dirty,
    props.hasErrors,
    props.model,
    isLoaded,
    route,
  ]);

  // Storing these as a ref to make sure we're always invoking the latest state
  // of these functions
  const onSaveRef = useRef(props.onSave);
  const onCloseRef = useRef(props.onClose);

  useEffect(() => {
    onSaveRef.current = props.onSave;
  }, [props.onSave]);

  useEffect(() => {
    onCloseRef.current = props.onClose;
  }, [props.onClose]);

  // Listen for postMessages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.source === "zesty") {
        switch (event.data.action) {
          case "close":
            if (onCloseRef.current) {
              onCloseRef.current();
            }
            break;

          case "save":
            if (onSaveRef.current) {
              onSaveRef.current();
            }
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
    <Box
      height="100%"
      width="100%"
      sx={(theme) => ({
        border: `1px solid ${theme.palette.border}`,
        borderRadius: "8px",
      })}
      component="iframe"
      ref={preview}
      src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
      frameBorder="0"
    />
  );
}
