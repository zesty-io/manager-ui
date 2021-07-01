import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCodeBranch } from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./FileStatus.less";
import shared from "../../FileDrawer.less";

const FileType = props => {
  if (
    props.fileType === "templateset" ||
    props.fileType === "pageset" ||
    props.fileType === "dataset"
  ) {
    return `Model View`;
  }
  if (props.fileType === "ajax-json" || props.fileType === "ajax-html") {
    if (props.fileName.includes("html")) {
      return ` ${props.fileName.slice(0, -5)}.html`;
    } else {
      return ` ${props.fileName}.html`;
    }
  }

  if (props.fileType === "404") {
    return `404`;
  } else {
    return props.fileType;
  }
};

export default function FileStatus(props) {
  const instance = useSelector(state => state.instance);

  return (
    <Card className={cx(styles.FileStatus, shared.DrawerStyles)}>
      <CardHeader>
        <h1>
          <FontAwesomeIcon icon={faCodeBranch} /> Code File
        </h1>
      </CardHeader>
      <CardContent>
        <ul>
          {props.file.contentModelZUID && (
            <li>
              Model ZUID:&nbsp;
              <em className={styles.ZUID}>{props.file.contentModelZUID}</em>
            </li>
          )}

          <li>
            File Link:&nbsp;
            <Url
              className={styles.FileLink}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}/${props.file.fileName}`}
              target="_blank"
              title="Webengine link"
            >{`${props.file.fileName}`}</Url>
          </li>

          <li>
            File ZUID: <em className={styles.ZUID}>{props.file.ZUID}</em>
          </li>
          <li>
            File Type:&nbsp;
            <FileType
              fileType={props.file.type}
              fileName={props.file.fileName}
            />
          </li>

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
                title="Preview JSON"
              >
                <FontAwesomeIcon icon={faBolt} /> Instant JSON API
              </Url>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
