import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFilePdf } from "@fortawesome/free-solid-svg-icons";

import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { Card, CardContent } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import cx from "classnames";
import styles from "./MediaSelected.less";

export function MediaSelected(props) {
  const [open, setOpen] = useState(false);

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
        <Drawer
          className={styles.Drawer}
          position="bottom"
          offset="37px"
          open={open}
        >
          <DrawerHandle className={styles.DrawerHandle} onClick={handleSetOpen}>
            <Button title="Open for additional file information">
              {open ? (
                <i className="fas fa-chevron-down"></i>
              ) : (
                <i className="fas fa-chevron-up"></i>
              )}
            </Button>
          </DrawerHandle>
          <DrawerContent className={styles.DrawerContent}>
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
                        className={cx(
                          styles.CardContent,
                          styles.CardContentTop
                        )}
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
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
}
