import React from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import { MediaImage } from "./MediaImage";
import styles from "./MediaWorkspaceItem.less";

export function MediaWorkspaceItem(props) {
  const history = useHistory();
  return (
    <Card
      className={cx({
        [styles.Card]: true,
        [styles.selected]: props.selected
      })}
      onClick={() => props.toggleSelected(props.file)}
    >
      <CardContent className={styles.CardContent}>
        <div className={styles.Checkered}>
          <MediaImage file={props.file} params={"?w=200&h=200&type=fit"} />
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
