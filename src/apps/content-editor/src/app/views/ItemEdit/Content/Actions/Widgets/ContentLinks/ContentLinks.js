import { memo, Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { PreviewUrl } from "../../../../components/Header/PreviewUrl";
import { LiveUrl } from "../../../../components/Header/LiveUrl";
import { InstantUrl } from "./InstantUrl";

import styles from "./ContentLinks.less";

export const ContentLinks = memo(function ContentLinks(props) {
  return (
    <Fragment>
      <Card className={styles.ContentLinks}>
        <CardHeader>
          <FontAwesomeIcon icon={faLink} />
          &nbsp;Links
        </CardHeader>
        <CardContent className={styles.Content}>
          <ul>
            {props.item?.web?.path && (
              <Fragment>
                <li>
                  <LiveUrl item={props.item} />
                </li>
                <li>
                  <PreviewUrl item={props.item} />
                </li>
              </Fragment>
            )}

            <li>
              <InstantUrl item={props.item} />
            </li>
          </ul>
        </CardContent>
      </Card>
    </Fragment>
  );
});
