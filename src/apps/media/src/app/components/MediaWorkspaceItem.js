import { memo, useCallback, useState } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";

import EditIcon from "@mui/icons-material/Edit";
import Observer from "@researchgate/react-intersection-observer";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { MediaImage } from "./MediaImage";
import styles from "./MediaWorkspaceItem.less";
import shared from "./MediaShared.less";
import { isImage } from "../../app-revamp/components/Thumbnail/FileUtils";

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
        className={styles.Card}
        onClick={toggleSelected}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          ...(props.selected && {
            boxShadow: "0px 0px 6px #c3cddf",
          }),
        }}
      >
        <CardContent
          sx={{
            position: "relative",
            "&:hover": {
              "& .CheckIcon": {
                opacity: "1",
              },
            },

            ...(props.selected && {
              background: "secondary.main",
              opacity: "1",
              color: "theme.common.white",
            }),
          }}
        >
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
            <CheckBoxIcon
              className="CheckIcon"
              sx={{
                position: "absolute",
                top: "0",
                left: "0",
                cursor: "pointer",
                color: "primary.light",
                margin: "1px",
                opacity: "0",
                minWidth: "auto",

                ...(props.selected && {
                  color: "secondary.main",
                  opacity: "1",
                }),
              }}
            />
          ) : null}
        </CardContent>
        <CardActions
          className={styles.CardFooter}
          sx={{ position: "relative" }}
        >
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
        </CardActions>
      </Card>
    </div>
  );
});
