import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import { WithLoader } from "@zesty-io/core/WithLoader";
import styles from "./QuickJumps.less";

export function QuickJumps({
  cardTitle,
  quickJump,
  randomHashID,
  image,
  liveLink,
  docsLink,
  docsTitle
} = props) {
  return (
    <div>
      <Card>
        <CardContent>
          {/* QuickJumps links */}
          {quickJump && (
            <Url href={`/${quickJump}`} title={quickJump}>
              <FontAwesomeIcon icon={image} />
              &nbsp;{cardTitle}
            </Url>
          )}
          {/* Conditional for Preview */}
          {randomHashID && (
            <Url
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={image} />
              &nbsp;View Preview
            </Url>
          )}
          {/* Conditional for Live */}
          {liveLink && (
            <Url
              href={`//${liveLink}`}
              target="_blank"
              title="Open live link in standard browser window"
            >
              <FontAwesomeIcon icon={image} />
              &nbsp;View Live
            </Url>
          )}
        </CardContent>
        <CardFooter>
          <Url href={docsLink} target="_blank" title={docsLink}>
            &nbsp;{docsTitle}
          </Url>
        </CardFooter>
      </Card>
    </div>
  );
}
