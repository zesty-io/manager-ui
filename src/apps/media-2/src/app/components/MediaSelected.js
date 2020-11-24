import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import cx from "classnames";
import styles from "./MediaSelected.less";

export function MediaSelected(props) {
  return (
    <>
      {props.selected.length ? (
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
                    </div>
                    <button className={styles.Check}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </aside>
        </footer>
      ) : null}
    </>
  );
}
