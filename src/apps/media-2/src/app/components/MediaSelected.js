import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUpload } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { Card, CardContent } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
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
              <Button title="View Selected Images">
                {open ? (
                  <i className="fas fa-chevron-down"></i>
                ) : (
                  <i className="fas fa-chevron-up"></i>
                )}
              </Button>
              <span className={styles.bodyText}>
                {props.selected.length} / {props.limitSelected} Image
                {props.limitSelected > 1 ? "s" : ""} Selected
              </span>
            </DrawerHandle>
            <Button
              className={styles.ButtonLoad}
              kind="save"
              onClick={() => props.addImages(props.selected)}
            >
              <FontAwesomeIcon icon={faUpload} />
              <span>Load Selected</span>
            </Button>
            <DrawerContent className={styles.DrawerContent}>
              <aside className={styles.MediaSelected}>
                {props.selected.map(file => {
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
                        <button className={styles.Check} aria-label="Checked">
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
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
