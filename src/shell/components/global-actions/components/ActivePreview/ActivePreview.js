import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import PubSub from "pubsub-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

/**
 * NOTE: Preview holds a reference to a window object which
 * we attach event listeners to as such there is some concern with
 * react state holding on to a prior reference in the event of a render
 * preventing GC and causing a memory leak.
 */
let preview;

export default connect(state => {
  return {
    content: state.content
  };
})(function ActivePreview(props) {
  const origin = window.location.origin;
  const location = useLocation();

  function close() {
    if (preview) {
      preview.close();
    }
  }

  function refresh() {
    console.log("ActivePreview:refresh", preview);

    if (preview) {
      preview.postMessage(
        {
          source: "zesty",
          refresh: true
        },
        origin
      );
    }
  }

  // Sends message to preview window to update route
  function route(itemZUID) {
    console.log("ActivePreview:route", itemZUID, preview);

    if (preview) {
      // if not a string or a string that is not a content item zuid
      // then see if location contains a routable content item
      // only 7- resources are capable of having a path
      if (typeof itemZUID !== "string" || itemZUID.slice(0, 2) !== "7-") {
        itemZUID = location.pathname
          .split("/")
          .find(part => part.slice(0, 2) === "7-");
      }

      if (itemZUID) {
        const item = props.content[itemZUID];

        if (item && item.web.path) {
          preview.postMessage(
            {
              source: "zesty",
              route: item.web.path
            },
            origin
          );
        }
      }
    }
  }

  /**
   * Create new preview window or bring focus back to pre-existing window
   * Uses pubsub to listen for messages to update exsting preview
   */
  function open() {
    console.log("ActivePreview:open");

    if (preview) {
      // close before opening a new window
      preview.close();
    }

    preview = window.open(
      origin + "/active-preview",
      "Active Preview",
      "height=850, width=1260, location=0, menubar=0, status=0, titlebar=0, toolbar=0"
    );

    PubSub.subscribe("PREVIEW_REFRESH", refresh);

    // If instance manager is closed then close active preview
    window.addEventListener("beforeunload", close);

    // Send initial route on open
    preview.addEventListener("load", () =>
      setTimeout(route(location.pathname), 2000)
    );

    // if active preview is closed detach manager event listeners to avoid memory leak
    preview.addEventListener("beforeunload", () => {
      zesty.off("PREVIEW_REFRESH");
      window.removeEventListener("beforeunload", close);
    });
  }

  /**
   * This is the key to "active" preview
   * as a user navigates around the manager app
   * we check if the view they are on contains a routable ZUID
   */
  useEffect(() => {
    if (preview) {
      route(location.pathname);
    }
  }, [location.pathname]);

  return (
    <FontAwesomeIcon
      className={props.className}
      onClick={open}
      icon={faEye}
      title="Preview"
    />
  );
});
