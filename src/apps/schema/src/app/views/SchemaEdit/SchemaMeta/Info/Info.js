import React from "react";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Url } from "@zesty-io/core/Url";

import styles from "./Info.less";
export default function Info(props) {
  return (
    <Card className={styles.ModelInfo}>
      <CardHeader>
        <i className="fas fa-info-circle"></i>&nbsp;Model Info
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
                      <i className="fas fa-times-circle" title="false"></i>
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <i className="fas fa-check-circle"></i>
                    </span>
                  )}
                </strong>
              </li>

              <li>
                Has multiple items:{" "}
                <strong>
                  {props.model.type === "templateset" ? (
                    <span className={styles.no}>
                      <i className="fas fa-times-circle"></i>
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <i className="fas fa-check-circle"></i>
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
            {zesty.instance.settings.basic_content_api_enabled == 1 ? (
              <Url
                target="_blank"
                href={`${CONFIG.URL_PREVIEW}/-/instant/${props.model.ZUID}.json`}
              >
                <i className="fas fa-bolt" />
                &nbsp;{`/-/instant/${props.model.ZUID}.json`}
              </Url>
            ) : (
              <Url href="/config/settings/developer/">
                <i className="fas fa-cog" />
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
                <i className="fas fa-plus"></i>&nbsp;Add Item
              </Url>
            </li>
          )}

          <li>
            <Url href={`/content/${props.model.ZUID}`}>
              <i className="fas fa-edit"></i>&nbsp;Edit Item(s)
            </Url>
          </li>
          <li>
            <Url href={`/editor`}>
              <i className="fas fa-code"></i>&nbsp;Edit Code
            </Url>
          </li>
        </ul>
      </CardFooter>
    </Card>
  );
}
