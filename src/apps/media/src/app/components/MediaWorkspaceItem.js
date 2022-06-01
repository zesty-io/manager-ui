import { memo, useCallback, useState } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import Observer from "@researchgate/react-intersection-observer";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import { MediaImage } from "./MediaImage";
import styles from "./MediaWorkspaceItem.less";
import shared from "./MediaShared.less";
import { isImage } from "../FileUtils";

export const MediaWorkspaceItem = memo(function MediaWorkspaceItem(props) {
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
    (event) => {
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
          [styles.selected]: props.selected,
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
            <Button
              variant="contained"
              className={styles.Check}
              aria-label="Checked"
              size="small"
              sx={{
                position: "absolute",
                top: "0",
                left: "0",
                cursor: "pointer",
                backgroundColor: "primary.light",
                margin: "1px",
                opacity: "0",
                minWidth: "auto",
                "&:hover": {
                  opacity: "1",
                },
              }}
            >
              <CheckIcon fontSize="small" />
            </Button>
          ) : null}
        </CardContent>
        <CardFooter className={styles.CardFooter}>
          {props.file.loading && props.file.progress != null && (
            <div
              className={styles.ProgressBar}
              style={{
                width: `${props.file.progress}%`,
              }}
            ></div>
          )}
          <Button
            variant="outline"
            onClick={showFileDetails}
            startIcon={<EditIcon />}
            fullWidth
            sx={{
              borderRadius: "0",
              cursor: "pointer",
            }}
          >
            <span className={cx(styles.Preview)}>{props.file.filename}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
});
