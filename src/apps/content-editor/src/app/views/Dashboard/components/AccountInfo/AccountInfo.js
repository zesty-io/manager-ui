import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faFileImage
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardFooter, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import styles from "./AccountInfo.less";

export function AccountInfo(props) {
  const [faviconURL, setFaviconURL] = useState("");

  useEffect(() => {
    const tag = Object.values(props.headTags).find(tag =>
      tag.attributes.find(
        attr => attr.key === "sizes" && attr.value === "196x196"
      )
    );
    if (tag) {
      const attr = tag.attributes.find(attr => attr.key === "href");
      setFaviconURL(attr.value);
    }
  }, [props.headTags]);

  return (
    <div className={styles.AccountInfo}>
      <Card className={styles.Card}>
        <CardContent className={styles.CardContent}>
          {faviconURL ? (
            <img src={faviconURL} height="64px" width="64px" />
          ) : (
            <FontAwesomeIcon icon={faFileImage} />
          )}

          <div className={styles.Links}>
            {/* <p>
              ZUID: <mark>{props.instanceZUID}</mark>
            </p> */}
            {props.domain && (
              <Url
                className={styles.Live}
                href={`//${props.domain}`}
                target="_blank"
                title="Open live link in standard browser window"
              >
                <FontAwesomeIcon icon={faHome} />
                &nbsp;View Live Domain
              </Url>
            )}
            <Url
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={faEye} />
              &nbsp;View WebEngine Preview
            </Url>
            <Url
              title="Open this instance accounts overview"
              href={`${CONFIG.URL_ACCOUNTS}/instances/${props.instanceZUID}`}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp; Instance Admin
            </Url>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
