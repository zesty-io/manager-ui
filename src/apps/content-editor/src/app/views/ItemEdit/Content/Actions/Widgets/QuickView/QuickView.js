import { memo, Fragment } from "react";
import { useFilePath } from "shell/hooks/useFilePath";
import moment from "moment-timezone";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faCode } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { AppLink } from "@zesty-io/core/AppLink";
import { CopyButton } from "@zesty-io/material";

import { usePermission } from "shell/hooks/use-permissions";

import SharedWidgetStyles from "../SharedWidget.less";
import styles from "./QuickView.less";

export const QuickView = memo(function QuickView(props) {
  const isPublished = props.publishing && props.publishing.isPublished;
  const isScheduled = props.scheduling && props.scheduling.isScheduled;

  const codeAccess = usePermission("CODE");
  const codePath = useFilePath(props.modelZUID);

  return (
    <Fragment>
      <Card className={styles.QuickView} sx={{ m: 2 }}>
        <CardHeader
          avatar={<AccountTreeIcon fontSize="small" />}
          title={
            <section className={styles.StatusHeader}>
              <div>&nbsp;Item Status</div>
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
          }
        ></CardHeader>
        <CardContent
          className={cx(styles.Content, SharedWidgetStyles.CardListSpace)}
        >
          <ul>
            <li>
              <strong>ZUID:</strong>&nbsp;
              <CopyButton size="small" value={props.itemZUID} />
            </li>
            <li>
              <strong>Language:</strong>&nbsp;
              <span>
                {Object.keys(props.siblings || {}).find(
                  (lang) => props.siblings[lang] === props.itemZUID
                )}
              </span>
            </li>
            <li>Last edited {moment(props.updatedAt).fromNow()}</li>
            {props.publishing && props.publishing.version && (
              <li>Version {props.publishing.version} is published</li>
            )}
            {props.scheduling && props.scheduling.version && (
              <li>Version {props.scheduling.version} is scheduled</li>
            )}
            <li>Viewing version {props.version}</li>
            <li>
              Your timezone is <strong>{moment.tz.guess()}</strong>
            </li>
          </ul>
        </CardContent>
        <CardActions sx={{ gap: 1 }}>
          {codeAccess && (
            <>
              <AppLink to={`/schema/${props.modelZUID}`}>
                <FontAwesomeIcon icon={faDatabase} />
                &nbsp;Edit Schema
              </AppLink>
              <AppLink to={codePath}>
                <FontAwesomeIcon icon={faCode} />
                &nbsp;Edit Code
              </AppLink>
            </>
          )}
        </CardActions>
      </Card>
    </Fragment>
  );
});
