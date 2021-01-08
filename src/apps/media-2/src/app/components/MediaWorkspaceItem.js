import React, { useCallback, useRef } from "react";
import cx from "classnames";
import { useDrag } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import { MediaImage } from "./MediaImage";
import styles from "./MediaWorkspaceItem.less";
import shared from "./MediaShared.less";

export const MediaWorkspaceItem = React.memo(function MediaWorkspaceItem(
  props
) {
  const ref = useRef(null);
  const [, drag] = useDrag({
    item: {
      type: "file",
      id: props.file.id,
      bin_id: props.file.bin_id
    },
    canDrag() {
      if (!props.file.id) {
        return false;
      }
      return true;
    }
  });

  drag(ref);

  const toggleSelected = useCallback(() => {
    if (props.toggleSelected && !props.file.loading) {
      props.toggleSelected(props.file);
    }
  }, [props.toggleSelected, props.file]);

  const showFileDetails = useCallback(
    event => {
      if (!props.file.loading) {
        event.stopPropagation();
        props.showFileDetails(props.file);
      }
    },
    [props.showFileDetails, props.file]
  );

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <Card
        className={cx({
          [styles.Card]: true,
          [styles.selected]: props.selected
        })}
        onClick={toggleSelected}
      >
        <CardContent className={styles.CardContent}>
          <figure className={cx(shared.Checkered, shared.Cgrid)}>
            <MediaImage file={props.file} params={"?w=200&h=200&type=fit"} />
            {props.file.loading && (
              <div className={cx(styles.Load, styles.Loading)}></div>
            )}
          </figure>
          {props.modal ? (
            <button className={styles.Check} aria-label="Checked">
              <FontAwesomeIcon icon={faCheck} />
            </button>
          ) : null}
        </CardContent>
        <CardFooter className={styles.CardFooter}>
          {props.file.loading && props.file.progress != null && (
            <div
              className={styles.ProgressBar}
              style={{
                width: `${props.file.progress}%`
              }}
            ></div>
          )}
          <button className={styles.FooterButton} onClick={showFileDetails}>
            <FontAwesomeIcon className={styles.Cog} icon={faCog} />
            <h1 className={styles.Preview}>{props.file.filename}</h1>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
});
