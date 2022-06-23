import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./QuickJumps.less";

export function QuickJumps(props) {
  return (
    <div className={styles.QuickJumps}>
      <Card sx={{ m: 2, flex: "1" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
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
            color="primary"
            href={props.docsLink}
            target="_blank"
            title={props.docsLink}
            sx={{ mt: 1.5 }}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;Documentation
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
