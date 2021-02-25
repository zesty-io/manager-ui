import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { getUserLogs } from "shell/store/user";

import styles from "./QuickJumps.less";

export function QuickJumps(
  props,
  { randomHashID, domain } = this.props.instance
) {
  console.log(domain);
  return (
    <div>
      <Card>
        <CardHeader>{props.cardTitle}</CardHeader>
        <CardContent>
          <Url
            href={`//${domain}`}
            target="_blank"
            title="Open live link in standard browser window"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;View Live
          </Url>
          {randomHashID && (
            <Url
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              &nbsp;View Preview
            </Url>
          )}
          {domain && (
            <Url
              href={`//${domain}`}
              target="_blank"
              title="Open live link in standard browser window"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              &nbsp;View Live
            </Url>
          )}
        </CardContent>
        <CardFooter>
          <Url href={props.docsLink} target="_blank" title={props.docsLink}>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;{props.docsTitle}
          </Url>
        </CardFooter>
      </Card>
    </div>
  );
}
