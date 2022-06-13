import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faLink } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import StorageIcon from "@mui/icons-material/Storage";

import { AppLink } from "@zesty-io/core/AppLink";

import Link from "@mui/material/Link";

import styles from "./LinkedSchema.less";
import shared from "../../FileDrawer.less";

export default function LinkedSchema(props) {
  return (
    <Card
      className={cx(styles.LinkedSchema, shared.DrawerStyles)}
      sx={{ m: 2 }}
    >
      <CardHeader
        avatar={<StorageIcon fontSize="small" />}
        title={`${props.file.fileName}'s  Related Model Schema`}
      ></CardHeader>
      <CardContent>
        <p>
          Use the below Parsley syntax to reference this models fields. This
          will dynamically link to the fields content.&nbsp;
          <Link
            href="https://zesty.org/services/web-engine/introduction-to-parsley"
            target="_blank"
            title="Learn More Parsley Syntax"
          >
            Learn More Parsley Syntax
          </Link>
        </p>

        <ul>
          {props.fields.map((field) => (
            <li key={field.ZUID}>
              <span className={styles.ParsleyRef}>
                <span className={styles.Brace}>{"{{"}</span>
                <span className={styles.ModelRef}>this.</span>
                <span className={styles.FieldRef}>{field.name}</span>
                <span className={styles.Brace}>{"}}"}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardActions>
        <p>
          <AppLink
            className={styles.Link}
            to={`/schema/${props.file.contentModelZUID}`}
            title="Edit Related Model"
          >
            <FontAwesomeIcon icon={faLink} />
            Edit Linked Schema
          </AppLink>
        </p>
      </CardActions>
    </Card>
  );
}
