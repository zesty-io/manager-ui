import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

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
    <div className={styles.QuickJumps}>
      <Card>
        <CardContent className={styles.CardContent}>
          <AppLink
            to={`/${quickJump}`}
            title={quickJump}
            className={styles.title}
          >
            <FontAwesomeIcon className={styles.Icon} icon={image} />
            {cardTitle}
          </AppLink>

          <Url
            href={docsLink}
            target="_blank"
            title={docsLink}
            className={cx(styles.bodyText, styles.Docs)}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;Read Documentation
          </Url>
        </CardContent>
      </Card>
    </div>
  );
}
