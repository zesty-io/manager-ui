import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faLink } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
import cx from "classnames";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import EditIcon from "@mui/icons-material/Edit";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./LinkedContent.less";
import shared from "../../FileDrawer.less";

export default function LinkedContent(props) {
  return (
    <Card
      className={cx(styles.LinkedContent, shared.DrawerStyles)}
      sx={{ m: 2 }}
    >
      <CardHeader
        avatar={<EditIcon fontSize="small" />}
        title="Linked Content"
      ></CardHeader>
      <CardContent>
        <p>
          Shown are the three latest content entries from this views linked
          model.
        </p>

        <ul>
          {props.items.map((item) => {
            return (
              <li key={item.meta.ZUID}>
                <p>
                  <AppLink
                    className={styles.Link}
                    to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                    title="Edit item content"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <strong>{item.web.metaTitle}</strong>{" "}
                  </AppLink>
                </p>

                <p>
                  <Link
                    underline="none"
                    color="secondary"
                    sx={{
                      alignItems: "baseline",
                      display: "flex",
                    }}
                    href={`${CONFIG.URL_PREVIEW_FULL}${item.web.path}`}
                    target="_blank"
                    title="Preview Item Webpage"
                  >
                    <FontAwesomeIcon icon={faEye} /> <em>{item.web.path}</em>
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardActions>
        <p>
          <AppLink
            className={styles.Link}
            to={`/content/${props.file.contentModelZUID}`}
            title="Edit Related Content"
          >
            <FontAwesomeIcon icon={faLink} />
            Edit Linked Content
          </AppLink>
        </p>
      </CardActions>
    </Card>
  );
}
