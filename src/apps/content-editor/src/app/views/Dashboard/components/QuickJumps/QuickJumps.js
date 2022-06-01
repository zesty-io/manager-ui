import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import { Card, CardContent } from "@zesty-io/core/Card";
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

          <Link
            underline="none"
            color="secondary"
            href={props.docsLink}
            target="_blank"
            title={props.docsLink}
            sx={{ mt: 1.5, color: "primary.main" }}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;Documentation
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
