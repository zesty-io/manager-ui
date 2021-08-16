import { memo, Fragment, useState } from "react";
import { useFilePath } from "shell/hooks/useFilePath";
import moment from "moment-timezone";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faBolt,
  faDatabase,
  faCode,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import { usePermission } from "shell/hooks/use-permissions";

import SharedWidgetStyles from "../SharedWidget.less";
import styles from "./QuickView.less";
export const QuickView = memo(function QuickView(props) {
  const isPublished = props.publishing && props.publishing.isPublished;
  const isScheduled = props.scheduling && props.scheduling.isScheduled;

  const codeAccess = usePermission("CODE");

  const codePath = useFilePath(props.modelZUID);

  const [copy, setCopy] = useState("");

  const handleCopy = (evt) => {
    console.log(evt.target.innerHTML);
    setCopy(evt.target.innerHTML);
    console.log(copy);
    console.log(navigator.clipboard.writeText(copy));
  };

  return (
    <Fragment>
      <Card className={styles.QuickView}>
        <CardHeader>
          <section className={styles.StatusHeader}>
            <div>
              <FontAwesomeIcon icon={faCodeBranch} />
              &nbsp;Item Status
            </div>
            <div
              className={
                isPublished
                  ? styles.Published
                  : isScheduled
                  ? styles.Scheduled
                  : styles.Unpublished
              }
            >
              {isPublished
                ? "Published"
                : isScheduled
                ? "Scheduled"
                : "Unpublished"}
            </div>
          </section>
        </CardHeader>
        <CardContent
          className={cx(styles.Content, SharedWidgetStyles.CardListSpace)}
        >
          <ul>
            <li>
              <strong>ZUID:</strong>&nbsp;
              <span onClick={handleCopy}>{props.itemZUID}</span>
              <FontAwesomeIcon icon={faCopy} />
            </li>
            <li>
              <strong>Language:</strong>&nbsp;
              <span>
                {Object.keys(props.siblings || {}).find(
                  (lang) => props.siblings[lang] === props.itemZUID
                )}
              </span>
            </li>
            {codeAccess && (
              <li>
                <strong>API:</strong>&nbsp;
                <Url
                  target="_blank"
                  title="Instant API"
                  href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.itemZUID}.json`}
                >
                  <FontAwesomeIcon icon={faBolt} />
                  &nbsp;{`/-/instant/${props.itemZUID}.json`}
                </Url>
              </li>
            )}
            <li>Last edited {moment(props.updatedAt).fromNow()}</li>
            {props.publishing && props.publishing.version && (
              <li>Version {props.publishing.version} is published</li>
            )}
            {props.scheduling && props.scheduling.version && (
              <li>Version {props.scheduling.version} is scheduled</li>
            )}
            <li>Viewing version {props.version}</li>
          </ul>

          <p className={styles.timezone}>
            Your timezone is <strong>{moment.tz.guess()}</strong>
          </p>
        </CardContent>
        <CardFooter className={SharedWidgetStyles.FooterSpacing}>
          {codeAccess && (
            <ButtonGroup>
              <AppLink to={`/schema/${props.modelZUID}`}>
                <FontAwesomeIcon icon={faDatabase} />
                &nbsp;Edit Schema
              </AppLink>
              <AppLink to={codePath}>
                <FontAwesomeIcon icon={faCode} />
                &nbsp;Edit Code
              </AppLink>
            </ButtonGroup>
          )}
        </CardFooter>
      </Card>
    </Fragment>
  );
});
