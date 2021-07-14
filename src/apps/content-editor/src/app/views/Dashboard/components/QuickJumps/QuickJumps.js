import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./QuickJumps.less";

export function QuickJumps(props) {
  return (
    <div className={styles.QuickJumps}>
      <Card className={styles.Card}>
        <CardContent className={styles.CardContent}>
          <AppLink
            to={`/${props.quickJump}`}
            title={props.quickJump}
            className={styles.title}
          >
            <FontAwesomeIcon className={styles.Icon} icon={props.image} />
            {props.cardTitle}
          </AppLink>

          <Url
            href={props.docsLink}
            target="_blank"
            title={props.docsLink}
            className={cx(styles.bodyText, styles.Docs)}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;Documentation
          </Url>
        </CardContent>
      </Card>
    </div>
  );
}
