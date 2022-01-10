import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactJson from "react-json-view";

import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./PreviewMode.less";

export default function PreviewMode(props) {
  const origin = window.location.origin;

  const instance = useSelector((state) => state.instance);
  const content = useSelector((state) => state.content);

  const [getZUID, setGetZUID] = useState(``);
  const [getData, setGetData] = useState("");

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

        if (item && item.web.path) {
          preview.current.contentWindow.postMessage(
            {
              source: "zesty",
              route: item.web.path,
            },
            origin
          );
          setGetItem(item);
        } else {
          preview.current.contentWindow.postMessage(
            {
              source: "zesty",
              route: `/-/instant/${item.meta.ZUID}.json`,
            },
            origin
          );
          setGetZUID(item.meta.ZUID);
        }
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

  useEffect(() => {
    fetch(`${CONFIG.URL_PREVIEW_FULL}/-/instant/${getZUID}.json`)
      .then((response) => response.json())
      .then((data) => setGetData(data));
  }, [getZUID]);

  return (
    <div data-cy="DuoModeContainer" className={styles.DMContainer}>
      {props.dirty && (
        <div className={styles.Overlay}>
          {" "}
          <p>Save to Update Preview </p>
        </div>
      )}

      {getZUID ? (
        <div className={styles.ReactJson}>
          <ReactJson src={getData} />
        </div>
      ) : (
        <iframe
          className={props.dirty ? styles.Blur : ""}
          ref={preview}
          src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
          frameBorder="0"
        ></iframe>
      )}
    </div>
  );
}
