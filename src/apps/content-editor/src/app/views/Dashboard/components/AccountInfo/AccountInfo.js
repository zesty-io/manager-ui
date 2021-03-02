import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faUsers,
  faFileImage
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import styles from "./AccountInfo.less";

export function AccountInfo({
  instanceName,
  instanceZUID,
  domain,
  randomHashID
} = props) {
  return (
    <div className={styles.AccountInfo}>
      <Card>
        <CardHeader>
          <p>Account: {instanceName}</p>
          <p>
            {" "}
            ZUID: <mark>{instanceZUID}</mark>
          </p>
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
              &nbsp; You: 8
            </p>
            <p>
              <FontAwesomeIcon icon={faUsers} />
              &nbsp; Everyone: 8
            </p>
          </div>

          {instanceZUID ? (
            <img
              src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${instanceZUID}/getimage/&type=fit`}
            />
          ) : (
            <FontAwesomeIcon icon={faFileImage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
