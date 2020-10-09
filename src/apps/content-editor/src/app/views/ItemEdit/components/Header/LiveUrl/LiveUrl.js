import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./LiveUrl.less";
export class LiveUrl extends React.Component {
  render() {
    // TODO fix instance protocol and prefix
    // const urlString = `${this.props.instance.protocol}://${
    //   this.props.instance.prefix == 1 ? "www." : ""
    // }${this.props.instance.domain}${
    //   this.props.item.web.pathPart !== "zesty_home"
    //     ? this.props.item.web.path
    //     : ""
    // }`;

    const urlString = `http://${this.props.instance.domain}${
      this.props.item.web.pathPart !== "zesty_home"
        ? this.props.item.web.path
        : ""
    }`;

    const isPublished =
      this.props.item.publishing && this.props.item.publishing.isPublished;

    return (
      <Url
        target="_blank"
        href={isPublished && urlString}
        className={isPublished ? styles.Published : styles.Unpublished}
      >
        {this.props.item.web.pathPart === "zesty_home" ? (
          <FontAwesomeIcon icon={faHome} />
        ) : isPublished ? (
          <FontAwesomeIcon icon={faLink} />
        ) : (
          <FontAwesomeIcon icon={faUnlink} />
        )}
        &nbsp;
        {/* {urlString} */}
        {isPublished ? <span>Live</span> : <span>Offline</span>}
      </Url>
    );
  }
}
