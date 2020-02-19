import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";
import { Save } from "./components/Save";
import { Status } from "./components/Status";
import { Publish } from "./components/Publish";
import { VersionSelector } from "./components/VersionSelector";

import styles from "./SubHeader.less";
export default function SubHeader(props) {
  return (
    <header className={styles.SubHeader}>
      <div className={styles.preview}>
        {props.item.web.path && (
          <Url
            className={styles.PreviewUrl}
            target="_blank"
            title={`${props.instance.preview_domain}${props.item.web.path}`}
            href={`${props.instance.preview_domain}${props.item.web.path}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </Url>
        )}
      </div>
      <div className={styles.status}>
        <Status item={props.item} />
      </div>
      {/* <div className={styles.version}>
        <VersionSelector item={props.item} />
      </div> */}
      <div className={styles.save}>
        <Save item={props.item} />
      </div>
      <div className={styles.publish}>
        <Publish item={props.item} />
      </div>
    </header>
  );
}
