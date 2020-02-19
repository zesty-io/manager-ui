import React, { useState, Fragment } from "react";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faBolt,
  faEnvelope,
  faDatabase,
  faCode
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import { WorkflowRequest } from "../WorkflowRequest";

import styles from "./QuickView.less";
export const QuickView = React.memo(function QuickView(props) {
  const isPublished = props.publishing && props.publishing.isPublished;
  const isScheduled = props.scheduling && props.scheduling.isScheduled;

  const [workflowRequestOpen, setWorkFlowRequestOpen] = useState(false);

  const handleWorkflow = () => {
    setWorkFlowRequestOpen(!workflowRequestOpen);
  };

  return (
    <Fragment>
      <Card className={styles.QuickView}>
        <CardHeader>
          <section className={styles.StatusHeader}>
            <article>
              <FontAwesomeIcon icon={faCodeBranch} />
              &nbsp;Item Status
            </article>
            <article
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
            </article>
          </section>
        </CardHeader>
        <CardContent className={styles.Content}>
          <ul>
            <li>
              <strong>ZUID:</strong>&nbsp;
              <span className={styles.ZUID}>{props.itemZUID}</span>
            </li>
            <li>
              <strong>Language:</strong>&nbsp;
              <span>
                {Object.keys(props.siblings || {}).find(
                  lang => props.siblings[lang] === props.itemZUID
                )}
              </span>
            </li>
            {props.basicApi ? (
              <li>
                <strong>API:</strong>&nbsp;
                <Url
                  target="_blank"
                  href={`${
                    props.live_domain
                      ? `${props.protocol}://${props.live_domain}`
                      : props.preview_domain
                  }/-/instant/${props.itemZUID}.json`}
                >
                  <FontAwesomeIcon icon={faBolt} />
                  &nbsp;{`/-/instant/${props.itemZUID}.json`}
                </Url>
              </li>
            ) : null}
            <li>Last edited {moment(props.updatedAt).fromNow()}</li>
            {props.publishing && props.publishing.version && (
              <li>Version {props.publishing.version} is published</li>
            )}
            {props.scheduling && props.scheduling.version && (
              <li>Version {props.scheduling.version} is scheduled</li>
            )}
            <li>Viewing version {props.version}</li>
          </ul>
        </CardContent>
        <CardFooter>
          <ButtonGroup>
            <Button id="WorkflowRequestButton" onClick={handleWorkflow}>
              <FontAwesomeIcon icon={faEnvelope} />
              Workflow Request
            </Button>
            <ButtonGroup>
              {props.is_developer && (
                <Url href={`/schema/${props.modelZUID}`}>
                  <FontAwesomeIcon icon={faDatabase} />
                  &nbsp;Edit Schema
                </Url>
              )}
              {props.is_developer && (
                <Url href="/code/">
                  <FontAwesomeIcon icon={faCode} />
                  &nbsp;Edit Code
                </Url>
              )}
            </ButtonGroup>
          </ButtonGroup>

          {workflowRequestOpen && (
            <WorkflowRequest
              itemTitle={props.metaTitle}
              handleClose={handleWorkflow}
              fields={props.fields}
            />
          )}
        </CardFooter>
      </Card>
    </Fragment>
  );
});
