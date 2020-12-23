import React from "react";

export default class MediaApp extends React.Component {
  componentDidMount() {
    /**
     * YOU AIN'T READY
     * That's right we are mounting a riot application within our React application.
     * Gross!!!
     * FIXME: Rebuild as a React sub app
     */
    riot.mount(document.querySelector("#media"), "media-app");
  }

  render() {
    return (
      /* total height minus header minus control-bar */
      <div id="media" style={{ height: "calc(100vh - 54px - 58px)" }}>
        {/* Yup. React syntax inline styles on a custom element. */}
        {/* <media-app style={{ display: "block", height: "100%" }}></media-app> */}
      </div>
    );
  }
}
