import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./ItemUrl.less";
export class ItemUrl extends React.Component {
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
      <article className={styles.PublicLink}>
        <Url
          target="_blank"
          href={isPublished && urlString}
          className={isPublished ? styles.Published : styles.Unpublished}
        >
          {this.props.item.web.pathPart === "zesty_home" ? (
            <FontAwesomeIcon icon={faHome} />
          ) : isPublished ? (
            <i
              className="icon fas fa-external-link-square-alt"
              aria-hidden="true"
            />
          ) : (
            <FontAwesomeIcon icon={faUnlink} />
          )}
          &nbsp;
          {urlString}
        </Url>
        {!isPublished && (
          <small className={styles.pubMessage}>[Unpublished]</small>
        )}
      </article>
    );
  }
}
