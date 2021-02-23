import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./HeaderDashboard.less";

export default function HeaderDashboard() {
  return (
    <header>
      {/* <Card>
        <CardHeader className={styles.DashboardHeader}>
          <h2>
            {this.props.instance.name} - Created Date:{" "}
            {this.props.instance.createdAt}{" "}
          </h2>
          <Url
            target="_blank"
            title={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
            href={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;View Preview
          </Url>
          {this.props.instance.domain && (
            <Url
              className={styles.Live}
              href={`//${this.props.instance.domain}`}
              target="_blank"
              title="Open live link in standard browser window"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              &nbsp;View Live
            </Url>
          )}
        </CardHeader>
      </Card> */}
      <h1>David Naimi</h1>
    </header>
  );
}
