import React from "react";

import { Url } from "@zesty-io/core/Url";

import styles from "./ItemUrl.less";
export class ItemUrl extends React.Component {
  render() {
    const urlString = `${this.props.instance.protocol}://${
      this.props.instance.prefix == 1 ? "www." : ""
    }${this.props.instance.live_domain}${
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
            <i className="fa fa-home" aria-hidden="true" />
          ) : isPublished ? (
            <i
              className="icon fas fa-external-link-square-alt"
              aria-hidden="true"
            />
          ) : (
            <i className="icon fas fa-unlink" aria-hidden="true" />
          )}
          &nbsp;
          {urlString}
        </Url>
        {!isPublished && (
          <small className={styles.pubMessage}>[Unpublished}</small>
        )}
      </article>
    );
  }
}
