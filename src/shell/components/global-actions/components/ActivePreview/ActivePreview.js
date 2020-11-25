import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

export default connect(state => {
  return {
    content: state.content
  };
})(function ActivePreview(props) {
  const origin = window.location.origin;
  const location = useLocation();

  /**
   * NOTE: Preview holds a reference to a window object which
   * we attach event listeners to as such there is some concern with
   * react state holding on to a prior reference in the event of a render
   * preventing GC and causing a memory leak.
   */
  const [preview, setPreview] = useState(null);

  function close() {
    if (preview) {
      preview.close();
    }
  }

  function open() {
    const winRef = window.open(
      origin + "/active-preview/",
      "Active Preview",
      "height=850, width=1400, location=0, menubar=0, status=0, titlebar=0, toolbar=0"
    );

    zesty.on("UPDATED_CONTENT_ITEM", itemZUID => route(itemZUID));
    zesty.on("FORCE_PREVIEW_RERENDER", itemZUID => route(itemZUID));

    // If instance manager is closed then close active preview
    window.addEventListener("beforeunload", close);

    // Send initial route on open
    winRef.addEventListener("load", () => route(location.pathname));

    // if active preview is closed detach manager event listeners to avoid memory leak
    winRef.addEventListener("beforeunload", () => {
      zesty.off("UPDATED_CONTENT_ITEM");
      zesty.off("FORCE_PREVIEW_RERENDER");
      window.removeEventListener("beforeunload", close);
    });

    setPreview(winRef);
  }

  // Sends message to preview window to update route
  function route(itemZUID) {
    console.log("route", itemZUID);

    if (preview) {
      // if not a string or a string that is not a content item zuid
      // then see if location contains a routable content item
      // only 7- resources are capable of having a path
      if (typeof itemZUID !== "string" || itemZUID.slice(0, 2) !== "7-") {
        itemZUID = location.pathname
          .split("/")
          .find(part => part.slice(0, 2) === "7-");
      }

      console.log("route:itemZUID", itemZUID);

      if (itemZUID && props.content[itemZUID]) {
        const item = props.content[itemZUID];

        console.log("route:item", item);

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
    }
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
    <FontAwesomeIcon className={props.className} onClick={open} icon={faEye} />
  );
});
