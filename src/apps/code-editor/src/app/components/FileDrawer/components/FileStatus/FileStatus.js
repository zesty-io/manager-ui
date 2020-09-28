import React from "react";
import moment from "moment";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./FileStatus.less";
export default function FileStatus(props) {
  return (
    <Card className={styles.FileStatus}>
      <CardHeader>
        <h1>
          <i className="fas fa-code-branch"></i> Code File
        </h1>
      </CardHeader>
      <CardContent>
        <ul>
          {props.file.contentModelZUID && (
            <li>
              Model ZUID:{" "}
              <em className={styles.ZUID}>{props.file.contentModelZUID}</em>
            </li>
          )}
          <li>
            File ZUID: <em className={styles.ZUID}>{props.file.ZUID}</em>
          </li>
          <li>File Type: {props.file.type}</li>

          <li>Branch: {props.file.status}</li>

          {props.file.publishedVersion ? (
            <li>Published: Version {props.file.publishedVersion} </li>
          ) : (
            <li>Not Published </li>
          )}
          <li>Viewing: Version {props.file.version} </li>

          <li>Last edited {moment(props.file.updatedAt).fromNow()}</li>

          {props.file.contentModelZUID && (
            <li>
              <Url
                className={styles.FileLink}
                href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.file.contentModelZUID}.json`}
                target="_blank"
              >
                <i className="fas fa-bolt"></i> Instant JSON API
              </Url>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
