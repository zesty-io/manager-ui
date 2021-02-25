import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./AccountInfo.less";

export function AccountInfo({ instanceZUID, domain, randomHashID } = props) {
  return (
    <div className={styles.AccountInfo}>
      <Card>
        <CardHeader>
          Account: <mark>{instanceZUID}</mark>
        </CardHeader>
        <CardContent className={styles.CardContent}>
          <div className={styles.Links}>
            {domain && (
              <Url
                className={styles.Live}
                href={`//${domain}`}
                target="_blank"
                title="Open live link in standard browser window"
              >
                <FontAwesomeIcon icon={faHome} />
                &nbsp;View Live
              </Url>
            )}
            <Url
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={faEye} />
              &nbsp;View Preview
            </Url>
            <Url
              target="_blank"
              title="Accounts Edit link"
              href={`https://accounts.zesty.io/instances/${instanceZUID}`}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp; Accounts Edit Link
            </Url>
            <p>
              <FontAwesomeIcon icon={faUsers} />
              &nbsp; Users: 8
            </p>
          </div>

          <img
            src="https://www.w3schools.com/howto/img_nature.jpg"
            alt="Placeholder"
          />
        </CardContent>
      </Card>
    </div>
  );
}
