import React from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import styles from "./MediaItem.less";

export function MediaItem(props) {
  const history = useHistory();
  return (
    <Card
      key={props.file.id}
      className={cx({
        [styles.Card]: true,
        [styles.selected]: props.selected
      })}
      onClick={() => props.toggleSelected(props.file)}
    >
      <CardContent className={styles.CardContent}>
        <div className={styles.Checkered}>
          <img
            src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${props.file.id}/getimage/?w=200&h=200&type=fit`}
            alt={props.file.title}
          />
          <FontAwesomeIcon className={styles.PDF} icon={faFilePdf} />
        </div>
        <div className={cx(styles.Load, styles.Loading)}></div>
        <button className={styles.Check} aria-label="Checked">
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </CardContent>
      <CardFooter className={styles.CardFooter}>
        <button className={styles.FooterButton}>
          <FontAwesomeIcon
            onClick={event => {
              event.stopPropagation();
              history.push(
                `/dam/${props.currentGroup.id}/file/${props.file.id}`
              );
            }}
            className={styles.Cog}
            icon={faCog}
          />

          <h1 className={styles.Preview}>{props.file.filename}</h1>
        </button>
      </CardFooter>
    </Card>
  );
}
