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

import { fileExtension } from "../FileUtils";
import styles from "./MediaImage.less";

export const MediaImage = React.forwardRef(function MediaImage(props, ref) {
  if (props.file.url.indexOf("blob:") !== -1) {
    return <img ref={ref} src={encodeURI(props.file.url)} />;
  }
  switch (fileExtension(props.file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      const src = `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${props.file.id}/getimage/${props.params}`;
      const options = {
        "data-src": props.lazy ? src : null,
        src: props.lazy ? null : src
      };
      return <img {...options} ref={ref} alt={props.file.title} />;
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
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileCode} />
        </div>
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileAudio} />
        </div>
      );
    case "pdf":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFilePdf} />
        </div>
      );
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileImage} />
        </div>
      );
    case "avi":
    case "flv":
    case "mp4":
    case "mpg":
    case "m4v":
    case "mov":
    case "qt":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileVideo} />
        </div>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileArchive} />
        </div>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileExcel} />
        </div>
      );

    case "ppt":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFilePowerpoint} />
        </div>
      );
    case "rtf":
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFileWord} />
        </div>
      );
    case "txt":
    case "exe":
    default:
      return (
        <div ref={ref}>
          <FontAwesomeIcon className={styles.icon} icon={faFile} />
        </div>
      );
  }
});
