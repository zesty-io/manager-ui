import React, { useCallback, useState } from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog } from "@fortawesome/free-solid-svg-icons";
import Observer from "@researchgate/react-intersection-observer";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import { MediaImage } from "./MediaImage";
import styles from "./MediaWorkspaceItem.less";
import shared from "./MediaShared.less";
import { isImage } from "../FileUtils";

export const MediaWorkspaceItem = React.memo(function MediaWorkspaceItem(
  props
) {
  const [lazyLoading, setLazyLoading] = useState(false);
  function handleIntersection(event) {
    if (event.isIntersecting) {
      const img = event.target;
      if (img.dataset.src && !img.onload) {
        setLazyLoading(true);
        img.src = img.dataset.src;
        img.onload = () => {
          setLazyLoading(false);
        };
      }
    }
  }

  const toggleSelected = useCallback(() => {
    if (props.toggleSelected && !props.file.loading) {
      props.toggleSelected(props.file);
    }
  }, [props.toggleSelected, props.file]);

  const showFileDetails = useCallback(
    event => {
      if (!props.file.loading) {
        event.stopPropagation();
        props.setCurrentFileID(props.file.id);
      }
    },
    [props.showFileDetails, props.file]
  );

  return (
    <div style={{ width: "100%" }}>
      <Card
        className={cx({
          [styles.Card]: true,
          [styles.selected]: props.selected
        })}
        onClick={toggleSelected}
      >
        <CardContent className={styles.CardContent}>
          <figure className={cx(shared.Checkered, shared.Cgrid)}>
            <Observer onChange={handleIntersection}>
              <MediaImage
                lazy={true}
                file={props.file}
                params={"?w=200&h=200&type=fit"}
              />
            </Observer>
            {isImage(props.file) && (props.file.loading || lazyLoading) ? (
              <div className={cx(styles.Load, styles.Loading)}></div>
            ) : null}
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
            <h1 className={cx(styles.Preview, styles.caption)}>
              {props.file.filename}
            </h1>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
});
