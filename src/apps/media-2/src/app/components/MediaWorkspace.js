import React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCog } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
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
                  <img src={file.url} alt={file.title} />
                </div>
                <div className={cx(styles.Load, styles.Loading)}></div>
                <button className={styles.Check} aria-label="Checked">
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </CardContent>
              <CardFooter className={styles.CardFooter}>
                <button className={styles.FooterButton}>
                  <FontAwesomeIcon
                    onClick={() => props.setFileDetails(file)}
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
