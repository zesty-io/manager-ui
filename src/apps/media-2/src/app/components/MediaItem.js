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
        return <FontAwesomeIcon className={styles.icon} icon={faFileCode} />;
      case "aac":
      case "aiff":
      case "mid":
      case "mp3":
        return <FontAwesomeIcon className={styles.icon} icon={faFileAudio} />;
      case "pdf":
        return <FontAwesomeIcon className={styles.icon} icon={faFilePdf} />;
      case "ai":
      case "bmp":
      case "eps":
        return <FontAwesomeIcon className={styles.icon} icon={faFileImage} />;
      case "avi":
      case "flv":
      case "mp4":
      case "mpg":
      case "m4v":
      case "mov":
        return <FontAwesomeIcon className={styles.icon} icon={faFileVideo} />;
      case "iso":
        return <FontAwesomeIcon className={styles.icon} icon={faFileArchive} />;
      case "ots":
        return <FontAwesomeIcon className={styles.icon} icon={faFileExcel} />;
      // case "ott":
      //   return `${basePath}ott.png`;
      // case "php":
      //   return `${basePath}php.png`;
      // case "ppt":
      //   return `${basePath}ppt.png`;
      // case "psd":
      //   return `${basePath}psd.png`;
      // case "py":
      //   return `${basePath}py.png`;
      // case "qt":
      //   return `${basePath}qt.png`;
      // case "rar":
      //   return `${basePath}rar.png`;
      // case "rb":
      //   return `${basePath}rb.png`;
      // case "rtf":
      //   return `${basePath}rtf.png`;
      // case "sass":
      //   return `${basePath}sass.png`;
      // case "scss":
      //   return `${basePath}scss.png`;
      // case "sql":
      //   return `${basePath}sql.png`;
      // case "tgz":
      //   return `${basePath}tgz.png`;
      // case "tiff":
      //   return `${basePath}tiff.png`;
      // case "txt":
      //   return `${basePath}txt.png`;
      // case "wav":
      //   return `${basePath}wav.png`;
      // case "xls":
      //   return `${basePath}xls.png`;
      // case "xlsx":
      //   return `${basePath}xlsx.png`;
      // case "xml":
      //   return `${basePath}xml.png`;
      // case "yml":
      //   return `${basePath}yml.png`;
      // case "zip":
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
