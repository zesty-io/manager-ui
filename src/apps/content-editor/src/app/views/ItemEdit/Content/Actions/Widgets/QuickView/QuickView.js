import React, { useState, Fragment } from "react";
import moment from "moment-timezone";

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
              <i className="fas fa-code-branch" aria-hidden="true" /> Item
              Status
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
                  <i className="fas fa-bolt" aria-hidden="true" />
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
              <i className="fas fa-envelope" />
              Workflow Request
            </Button>
            <ButtonGroup>
              {props.is_developer && (
                <Url href={`#!/schema/${props.modelZUID}`}>
                  <i className="icon fas fa-database" aria-hidden="true" />
                  &nbsp;Edit Schema
                </Url>
              )}
              {props.is_developer && (
                <Url href="#!/editor/">
                  <i className="icon fas fa-code" aria-hidden="true" />
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
