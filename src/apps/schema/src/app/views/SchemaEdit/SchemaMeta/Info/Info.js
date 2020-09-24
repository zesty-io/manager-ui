import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faTimesCircle,
  faCheckCircle,
  faBolt,
  faCog,
  faPlus,
  faCode,
  faEdit
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./Info.less";
export default function Info(props) {
  return (
    <Card className={styles.ModelInfo}>
      <CardHeader>
        <FontAwesomeIcon icon={faInfoCircle} />
        &nbsp;Model Info
      </CardHeader>
      <CardContent>
        <ul className={styles.StaticInfo}>
          <li>
            Label: <strong>{props.model.label}</strong>
          </li>
          <li>
            Reference Name: <strong>{props.model.name}</strong>
          </li>
          <li>
            Type: <strong>{props.model.type}</strong>
            <ul className={styles.SubList}>
              <li>
                Has item URLs:{" "}
                <strong>
                  {props.model.type === "dataset" ? (
                    <span className={styles.no}>
                      <FontAwesomeIcon icon={faTimesCircle} title="false" />
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  )}
                </strong>
              </li>

              <li>
                Has multiple items:{" "}
                <strong>
                  {props.model.type === "templateset" ? (
                    <span className={styles.no}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  )}
                </strong>
              </li>
            </ul>
          </li>

          <li>
            Created On: <strong>{props.model.createdAt}</strong>
          </li>
          <li>
            <abbr title="Zesty Universal ID">ZUID</abbr>:{" "}
            <strong>{props.model.ZUID}</strong>
          </li>
          <li>
            Instant API:{" "}
            {zestyStore.getState().instance.settings
              .basic_content_api_enabled == 1 ? (
              <Url
                target="_blank"
                href={`${CONFIG.URL_PREVIEW}/-/instant/${props.model.ZUID}.json`}
              >
                <FontAwesomeIcon icon={faBolt} />
                &nbsp;{`/-/instant/${props.model.ZUID}.json`}
              </Url>
            ) : (
              <Url href="/config/settings/developer/">
                <FontAwesomeIcon icon={faCog} />
                &nbsp;Activate Instant JSON API
              </Url>
            )}
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <ul className={styles.LinkList}>
          {props.model.type !== "templateset" && (
            <li>
              <Url href={`/content/${props.model.ZUID}/new`}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Add Item
              </Url>
            </li>
          )}

          <li>
            <Url href={`/content/${props.model.ZUID}`}>
              <FontAwesomeIcon icon={faEdit} />
              &nbsp;Edit Item(s)
            </Url>
          </li>
          <li>
            <Url href={`/code`}>
              <FontAwesomeIcon icon={faCode} />
              &nbsp;Edit Code
            </Url>
          </li>
        </ul>
      </CardFooter>
    </Card>
  );
}
