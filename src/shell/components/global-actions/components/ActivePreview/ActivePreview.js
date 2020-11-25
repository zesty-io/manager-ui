import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

export default connect(state => {
  return {
    content: state.content
  };
})(function ActivePreview(props) {
  let preview;

  const origin = window.location.origin;
  const location = useLocation();

  function route(itemZUID) {
    console.log("route", itemZUID);

    // if not a string or a string that is not an content item zuid
    // then see if location contains a routable content item
    if (typeof itemZUID !== "string" || itemZUID.slice(0, 2) !== "7-") {
      itemZUID = location.pathname
        .split("/")
        .find(part => part.slice(0, 2) === "7-");
    }

    console.log("route:itemZUID", itemZUID);

    if (itemZUID && props.content[itemZUID]) {
      const item = props.content[itemZUID];

      console.log("route:item", item);

      if (preview && item.web.path) {
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

  function close() {
    preview.close();
  }

  function open() {
    preview = window.open(
      origin + "/active-preview/",
      "Active Preview",
      "height=850, width=1400, location=0, menubar=0, status=0, titlebar=0, toolbar=0"
    );

    zesty.on("UPDATED_CONTENT_ITEM", itemZUID => route(itemZUID));
    zesty.on("FORCE_PREVIEW_RERENDER", itemZUID => route(itemZUID));

    // If instance manager is closed then close active preview
    window.addEventListener("beforeunload", close);

    // Send initial route on open
    preview.addEventListener("load", route);

    // if active preview is closed detach event listeners to avoid memory leak
    preview.addEventListener("beforeunload", function(evt) {
      zesty.off("UPDATED_CONTENT_ITEM");
      zesty.off("FORCE_PREVIEW_RERENDER");
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
    <FontAwesomeIcon className={props.className} onClick={open} icon={faEye} />
  );
});
