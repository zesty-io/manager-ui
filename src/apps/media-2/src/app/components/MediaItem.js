import React from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCog,
  faFile,
  faFileArchive,
  faFileAudio,
  faFileCode,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileVideo
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import styles from "./MediaItem.less";

function fileExtension(url) {
  return url
    .split(".")
    .pop()
    .toLowerCase();
}

export function MediaItem(props) {
  const history = useHistory();
  function renderImage() {
    switch (fileExtension(props.file.url)) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return (
          <img
            src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${props.file.id}/getimage/?w=200&h=200&type=fit`}
            alt={props.file.title}
          />
        );
      case "html":
      case "js":
      case "less":
      case "php":
      case "py":
      case "rb":
      case "sass":
      case "scss":
      case "sql":
      case "xml":
      case "yml":
        return <FontAwesomeIcon className={styles.icon} icon={faFileCode} />;
      case "aac":
      case "aiff":
      case "mid":
      case "mp3":
      case "wav":
        return <FontAwesomeIcon className={styles.icon} icon={faFileAudio} />;
      case "pdf":
        return <FontAwesomeIcon className={styles.icon} icon={faFilePdf} />;
      case "ai":
      case "bmp":
      case "eps":
      case "psd":
      case "tiff":
        return <FontAwesomeIcon className={styles.icon} icon={faFileImage} />;
      case "avi":
      case "flv":
      case "mp4":
      case "mpg":
      case "m4v":
      case "mov":
      case "qt":
        return <FontAwesomeIcon className={styles.icon} icon={faFileVideo} />;
      case "iso":
      case "rar":
      case "tgz":
      case "zip":
        return <FontAwesomeIcon className={styles.icon} icon={faFileArchive} />;
      case "ots":
      case "xls":
      case "xlsx":
        return <FontAwesomeIcon className={styles.icon} icon={faFileExcel} />;
      case "ppt":
        return (
          <FontAwesomeIcon className={styles.icon} icon={faFilePowerpoint} />
        );
      case "rtf":
        return <FontAwesomeIcon className={styles.icon} icon={faFileWord} />;
      case "txt":
      case "exe":
      default:
        return <FontAwesomeIcon className={styles.icon} icon={faFile} />;
    }
  }
  return (
    <Card
      key={props.file.id}
      className={cx({
        [styles.Card]: true,
        [styles.selected]: props.selected
      })}
      onClick={() => props.toggleSelected(props.file)}
    >
      <CardContent className={styles.CardContent}>
        <div className={styles.Checkered}>{renderImage()}</div>
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
                `/dam/${props.currentGroup.id}/file/${props.file.id}`
              );
            }}
            className={styles.Cog}
            icon={faCog}
          />

          <h1 className={styles.Preview}>{props.file.filename}</h1>
        </button>
      </CardFooter>
    </Card>
  );
}
