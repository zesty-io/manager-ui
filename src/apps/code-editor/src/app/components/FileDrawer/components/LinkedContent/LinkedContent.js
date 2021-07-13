import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faLink } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./LinkedContent.less";
import shared from "../../FileDrawer.less";

export default function LinkedContent(props) {
  return (
    <Card className={cx(styles.LinkedContent, shared.DrawerStyles)}>
      <CardHeader>
        <h1>
          <FontAwesomeIcon icon={faEdit} /> Linked Content
        </h1>
      </CardHeader>
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
                  <Url
                    className={styles.Link}
                    href={`${CONFIG.URL_PREVIEW_FULL}${item.web.path}`}
                    target="_blank"
                    title="Preview Item Webpage"
                  >
                    <FontAwesomeIcon icon={faEye} /> <em>{item.web.path}</em>
                  </Url>
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
