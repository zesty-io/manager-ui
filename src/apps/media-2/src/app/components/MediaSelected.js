import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { Card, CardContent } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { MediaImage } from "./MediaImage";
import styles from "./MediaSelected.less";

export function MediaSelected(props) {
  const [open, setOpen] = useState(true);

  function handleSetOpen() {
    // TODO persist to user settings
    setOpen(!open);
  }

  return (
    <>
      {/* {props.selected.length ? (
        <footer>
          <div className={styles.LoadSelected}>
            <Button kind="save">
              <span>Load Selected</span>
            </Button>
          </div>
          <aside className={styles.MediaSelected}>
            {props.selected.map(file => {
              return (
                <Card
                  className={cx(styles.Card, styles.CardTop)}
                  onClick={() => props.toggleSelected(file)}
                >
                  <CardContent
                    className={cx(styles.CardContent, styles.CardContentTop)}
                  >
                    <div className={styles.Checkered}>
                      <img src={file.url} alt={file.title} />
                      <FontAwesomeIcon
                        className={styles.PDF}
                        icon={faFilePdf}
                      />
                    </div>
                    <button className={styles.Check} aria-label="Checked">
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </aside>
        </footer>
      ) : null} */}

      {props.selected.length ? (
        <footer>
          <div className={styles.LoadSelected}>
            <Button kind="save">
              <span>Load Selected</span>
            </Button>

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
            </DrawerHandle>
          </div>
          <Drawer className={styles.Drawer} position="bottom" open={open}>
            <DrawerContent className={styles.DrawerContent}>
              <aside className={styles.MediaSelected}>
                {props.selected.map(file => {
                  return (
                    <Card
                      className={cx(styles.Card, styles.CardTop)}
                      onClick={() => props.toggleSelected(file)}
                    >
                      <CardContent
                        className={cx(
                          styles.CardContent,
                          styles.CardContentTop
                        )}
                      >
                        <div className={styles.Checkered}>
                          <MediaImage
                            file={file}
                            params={"?w=200&h=200&type=fit"}
                          />
                        </div>
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
