import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import cx from "classnames";
import styles from "./HeaderDashboard.less";

export function HeaderDashboard(
  { instanceName, createdAt, randomHashID, domain, firstName } = this.props
    .instance
) {
  return (
    <>
      <header>
        <Card>
          <CardHeader className={styles.DashboardHeader}>
            <h2>
              {instanceName} - Created Date: {createdAt}{" "}
            </h2>
            <Url
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              &nbsp;View Preview
            </Url>
            {domain && (
              <Url
                className={styles.Live}
                href={`//${domain}`}
                target="_blank"
                title="Open live link in standard browser window"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;View Live
              </Url>
            )}
          </CardHeader>
        </Card>
      </header>
      <h1 className={cx(styles.User, styles.subheadline)}>
        Ready to get cooking, {firstName}
      </h1>
    </>
  );
}
