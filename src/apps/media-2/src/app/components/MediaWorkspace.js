import React from "react";
import cx from "classnames";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  const history = useHistory();
  return (
    <main
      className={cx({
        [styles.Workspace]: true,
        [styles.hasSelected]: props.selected.length
      })}
    >
      <section className={styles.WorkspaceGrid}>
        {props.files.map(file => {
          return (
            <Card
              key={file.id}
              className={cx({
                [styles.Card]: true,
                [styles.selected]: props.selected.find(
                  selectedFile => selectedFile.id === file.id
                )
              })}
              onClick={() => props.toggleSelected(file)}
            >
              <CardContent className={styles.CardContent}>
                <div className={styles.Checkered}>
                  <img
                    src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${file.id}/getimage/?w=200&h=200&type=fit`}
                    alt={file.title}
                  />
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
                        `/dam/${props.currentGroup.id}/file/${file.id}`
                      );
                    }}
                    className={styles.Cog}
                    icon={faCog}
                  />

                  <h1 className={styles.Preview}>{file.filename}</h1>
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
