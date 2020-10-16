import React from "react";
import { connect } from "react-redux";

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
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./Info.less";
export default connect(state => {
  return {
    settings: state.settings
  };
})(function Info(props) {
  const instantJSON = props.settings.instance.find(
    setting => setting.key === "basic_content_api_enabled"
  );
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
            {instantJSON && instantJSON.value === "1" ? (
              <Url
                target="_blank"
                title="Preview JSON"
                href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.model.ZUID}.json`}
              >
                <FontAwesomeIcon icon={faBolt} />
                &nbsp;{`/-/instant/${props.model.ZUID}.json`}
              </Url>
            ) : (
              <AppLink to="/settings/instance/developer">
                <FontAwesomeIcon icon={faCog} />
                &nbsp;Activate Instant JSON API
              </AppLink>
            )}
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <ul className={styles.LinkList}>
          {props.model.type !== "templateset" && (
            <li>
              <AppLink to={`/content/${props.model.ZUID}/new`}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Add Item
              </AppLink>
            </li>
          )}

          <li>
            <AppLink to={`/content/${props.model.ZUID}`}>
              <FontAwesomeIcon icon={faEdit} />
              &nbsp;Edit Item(s)
            </AppLink>
          </li>
          <li>
            <AppLink to={`/code`}>
              <FontAwesomeIcon icon={faCode} />
              &nbsp;Edit Code
            </AppLink>
          </li>
        </ul>
      </CardFooter>
    </Card>
  );
});
