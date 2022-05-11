import { useState } from "react";

import Button from "@mui/material/Button";

import UploadIcon from "@mui/icons-material/Upload";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";

import cx from "classnames";
import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { Card, CardContent } from "@zesty-io/core/Card";

import { MediaImage } from "./MediaImage";

import shared from "./MediaShared.less";
import styles from "./MediaSelected.less";

export function MediaSelected(props) {
  const [open, setOpen] = useState(true);

  function handleSetOpen() {
    // TODO persist to user settings
    setOpen(!open);
  }

  return (
    <>
      {props.selected.length ? (
        <footer>
          <Drawer
            className={!open ? styles.DrawerClose : styles.DrawerOpen}
            position="bottom"
            open={open}
          >
            <DrawerHandle
              className={styles.DrawerHandle}
              onClick={handleSetOpen}
            >
              <Button
                variant="contained"
                color="success"
                data-cy="loadSelected"
                onClick={() => props.addImages(props.selected)}
                startIcon={<UploadIcon />}
              >
                Load Selected
              </Button>

              <Button
                variant="contained"
                title="View Selected Images"
                endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                <span
                  className={
                    props.selected.length !== props.limitSelected
                      ? styles.limitText
                      : styles.limitTextMax
                  }
                >
                  {props.selected.length} / {props.limitSelected} Image
                  {props.limitSelected > 1 ? "s" : ""} Selected
                </span>
              </Button>
            </DrawerHandle>

            <DrawerContent className={styles.DrawerContent}>
              <aside className={styles.MediaSelected}>
                {props.selected.map((file) => {
                  return (
                    <Card
                      key={file.id}
                      className={cx(styles.Card, styles.CardTop)}
                      onClick={() => props.toggleSelected(file)}
                    >
                      <CardContent
                        className={cx(
                          styles.CardContent,
                          styles.CardContentTop
                        )}
                      >
                        <figure
                          className={cx(shared.Checkered, styles.Checkered)}
                        >
                          <MediaImage
                            className={shared.Thumbnail}
                            file={file}
                            params={"?w=200&h=200&type=fit"}
                          />
                        </figure>
                        <Button
                          variant="contained"
                          size="small"
                          aria-label="Checked"
                          sx={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            cursor: "pointer",
                            backgroundColor: "secondary.main",

                            minWidth: "auto",
                          }}
                        >
                          <CheckIcon fontSize="small" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </aside>
            </DrawerContent>
          </Drawer>
        </footer>
      ) : null}
    </>
  );
}
