import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCog,
  faEdit,
  faUpload,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  return (
    <main className={styles.Workspace}>
      <section className={styles.WorkspaceGrid}>
        {props.files.map(file => {
          return (
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src={file.url} alt={file.title} />
                <button className={styles.Check}>
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
