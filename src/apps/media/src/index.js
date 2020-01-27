import React from "react";

window.MediaApp = class MediaApp extends React.Component {
  componentDidMount() {
    /**
     * YOU AIN'T READY
     * That's right we are mounting a riot application within our React application.
     * Gross!!!
     * FIXME: Rebuild as a React sub app
     */
    riot.mount("*");
  }

  render() {
    return (
      <div id="media">
        <media-app></media-app>
      </div>
    );
  }
};
