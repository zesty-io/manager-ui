import { useEffect, useState } from "react";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faCalendar,
  faCheckCircle,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";

import { ScheduleFlyout } from "./ScheduleFlyout";
import { VersionSelector } from "./VersionSelector";

import { publish } from "shell/store/content";
import { fetchAuditTrailPublish } from "shell/store/logs";
import { usePermission } from "shell/hooks/use-permissions";
import { useDomain } from "shell/hooks/use-domain";

import styles from "./ItemVersioning.less";
export function ItemVersioning(props) {
  const canPublish = usePermission("PUBLISH");
  const domain = useDomain();

  const [open, setOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [cached, setCached] = useState(false);

  const metaShortcut = useMetaKey("s", props.onSave);

  const checkCache = () => {
    if (props?.props?.item?.web?.path) {
      fetch(
        `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/getHeaders?url=${domain}${props.item.web.path}`
      )
        .then((res) => res.json())
        .then((json) => {
          const isOk = json["x-status"] === 200;
          // include 10 second gap as the URL could be experiencing significant traffic during a publish action
          const isBusted = Number(json.age) <= 10;
          // const isLang = json['content-language'] ===
          setCached(isOk && isBusted);
        });
    }
  };

  const handlePublish = () => {
    setPublishing(true);

    props
      .dispatch(
        publish(props.modelZUID, props.itemZUID, {
          version: props.item.meta.version,
        })
      )
      // fetch new publish history
      .then(() => {
        checkCache();
        props.dispatch(fetchAuditTrailPublish(props.itemZUID));
      })
      .finally(() => {
        setPublishing(false);
      });
  };

  const toggleScheduleModal = () => {
    setOpen(!open);
  };

  const handlePublishDisable = () => {
    // disable publish button if the publish request has gone off
    // if the item is dirty and needs to be saved
    // if the item is scheduled to be published
    // if the version being edited has already been published
    return (
      publishing ||
      props.item.dirty ||
      (props.item.scheduling && props.item.scheduling.isScheduled) ||
      (props.item.publishing &&
        props.item.publishing.version === props.item.meta.version)
    );
  };

  const handleScheduleDisable = () => {
    // if schedule exists do not disable as to allow for unscheduling
    if (props.item?.scheduling?.isScheduled) {
      return false;
    } else {
      // disable schedule
      // if the item is dirty and needs to be saved
      // if the current version is already published
      return (
        props.item.dirty ||
        (props.item.publishing &&
          props.item.publishing.version === props.item.meta.version)
      );
    }
  };

  let publishingDisabled = false;
  let schedulingDisabled = false;
  if (props.item && props.item.web && props.item.meta) {
    publishingDisabled = handlePublishDisable();
    schedulingDisabled = handleScheduleDisable();
  }

  useEffect(() => checkCache(), []);

  return (
    <ButtonGroup className={styles.Actions}>
      <VersionSelector modelZUID={props.modelZUID} itemZUID={props.itemZUID} />

      {canPublish && (
        <ButtonGroup className={styles.Publish}>
          <Button
            title="Publish"
            className={styles.PublishButton}
            id="PublishButton"
            kind="secondary"
            disabled={publishingDisabled || false}
            onClick={handlePublish}
          >
            {publishing ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : cached ? (
              <FontAwesomeIcon icon={faCheckCircle} title="CDN in sync" />
            ) : (
              <FontAwesomeIcon
                icon={faCloudUploadAlt}
                title="CDN out of sync"
              />
            )}
            <span className={styles.Hide}>Publish</span>
            <span className={styles.Hide}>&nbsp;Version&nbsp;</span>
            <span className={styles.Hide}>&nbsp;{props.item.meta.version}</span>
          </Button>
          <Button
            title="Publish Schedule"
            id="PublishScheduleButton"
            className={`${styles.ClockButton} ${
              props.item.scheduling && props.item.scheduling.isScheduled
                ? styles.Scheduled
                : ""
            }
              `}
            kind={open ? "tertiary" : "secondary"}
            disabled={schedulingDisabled || false}
            onClick={toggleScheduleModal}
          >
            <FontAwesomeIcon icon={faCalendar} />
          </Button>
          <ScheduleFlyout
            isOpen={open}
            item={props.item}
            dispatch={props.dispatch}
            toggleOpen={toggleScheduleModal}
          />
        </ButtonGroup>
      )}

      <Button
        title="Save Version"
        className={styles.Save}
        type="save"
        disabled={props.saving || !props.item.dirty}
        onClick={props.onSave}
        id="SaveItemButton"
      >
        {props.saving ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faSave} />
        )}
        <span className={styles.Test}>&nbsp;Save Version {metaShortcut}</span>
      </Button>
    </ButtonGroup>
  );
}
