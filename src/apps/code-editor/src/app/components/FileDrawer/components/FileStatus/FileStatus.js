import { useSelector } from "react-redux";
import moment from "moment";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCodeBranch } from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./FileStatus.less";
import shared from "../../FileDrawer.less";

const FileType = (props) => {
  if (
    props.fileType === "templateset" ||
    props.fileType === "pageset" ||
    props.fileType === "dataset"
  ) {
    return `Model View`;
  }
  if (props.fileType === "ajax-json" || props.fileType === "ajax-html") {
    if (props.fileName.includes("/")) {
      let extension = props.fileName.split(".").slice(-1);
      return `Custom File Type (${extension})`;
    } else {
      return `Legacy File`;
    }
  }

  if (props.fileType === "404") {
    return `404`;
  } else {
    return props.fileType;
  }
};

export default function FileStatus(props) {
  const instance = useSelector((state) => state.instance);

  return (
    <Card className={cx(styles.FileStatus, shared.DrawerStyles)}>
      <CardHeader>
        <h1>
          <FontAwesomeIcon icon={faCodeBranch} /> File Information
        </h1>
      </CardHeader>
      <CardContent>
        <ul>
          {props.file.contentModelZUID && (
            <li>
              Model ZUID:&nbsp;
              <AppLink
                className={styles.FileLink}
                to={`/schema/${props.file.contentModelZUID}`}
                title="Edit Related Model"
              >
                {props.file.contentModelZUID}
              </AppLink>
            </li>
          )}

          <li>
            WebEngine Link:&nbsp;
            {!props.file.fileName.includes("/") &&
              props.file.type.includes("ajax-html") && (
                <Url
                  className={styles.FileLink}
                  href={`${CONFIG.URL_PREVIEW_FULL}/-/ajax/${props.file.fileName}/`}
                  target="_blank"
                  title={`Preview ${props.file.fileName} Webpage`}
                >
                  <em>/-/ajax/{props.file.fileName}/</em>
                </Url>
              )}
            {!props.file.fileName.includes("/") &&
              props.file.type.includes("ajax-json") && (
                <Url
                  className={styles.FileLink}
                  href={`${CONFIG.URL_PREVIEW_FULL}/-/custom/${props.file.fileName}/`}
                  target="_blank"
                  title={`Preview ${props.file.fileName} Webpage`}
                >
                  <em>/-/custom/{props.file.fileName}/</em>
                </Url>
              )}
            {props.file.ZUID.includes("10-") &&
              props.file.type.includes("javascript") && (
                <Url
                  className={styles.FileLink}
                  href={`${CONFIG.URL_PREVIEW_FULL}/site.js`}
                  target="_blank"
                  title="Preview Javascript Webpage"
                >
                  <em>Compiles to /site.js</em>
                </Url>
              )}
            {props.file.ZUID.includes("10-") &&
              !props.file.type.includes("javascript") && (
                <Url
                  className={styles.FileLink}
                  href={`${CONFIG.URL_PREVIEW_FULL}/site.css`}
                  target="_blank"
                  title="Preview CSS Webpage"
                >
                  <em>Compiles to /site.css</em>
                </Url>
              )}
            {props.file.contentModelZUID && props.items.length !== 0 && (
              <Url
                className={styles.FileLink}
                href={`${CONFIG.URL_PREVIEW_FULL}${props.items[0].web.path}`}
                target="_blank"
                title={`Preview ${props.items[0].web.path} Webpage `}
              >
                <em>{props.items[0].web.path}</em>
              </Url>
            )}
            {!props.file.contentModelZUID &&
              props.file.fileName.includes("/") && (
                <Url
                  className={styles.FileLink}
                  href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}/${props.file.fileName}`}
                  target="_blank"
                  title={`"WebEngine ${props.file.fileName} Link"`}
                >{`${props.file.fileName}`}</Url>
              )}
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
                title={`Preview ${props.file.contentModelZUID} JSON`}
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
