import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFileArchive,
  faFileAudio,
  faFileCode,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileVideo
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MediaImage.less";

function fileExtension(url) {
  return url
    .split(".")
    .pop()
    .toLowerCase();
}

export function MediaImage(props) {
  if (props.file.url.indexOf("blob:") !== -1) {
    return <img src={encodeURI(props.file.url)} />;
  }
  switch (fileExtension(props.file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <img
          loading="lazy"
          src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${props.file.id}/getimage/${props.params}`}
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
