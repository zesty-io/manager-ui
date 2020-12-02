import React, { useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faCalendar
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";

import { ScheduleFlyout } from "./ScheduleFlyout";
import { VersionSelector } from "./VersionSelector";

import { publish } from "shell/store/content";
import { fetchAuditTrailPublish } from "shell/store/logs";
import { usePermission } from "shell/hooks/use-permissions";

import styles from "./ItemVersioning.less";
export default connect(state => {
  return {
    platform: state.platform
  };
})(function ItemVersioning(props) {
  const canPublish = usePermission("PUBLISH");
  const [open, setOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = () => {
    setPublishing(true);

    props
      .dispatch(
        publish(props.modelZUID, props.itemZUID, {
          version: props.item.meta.version
        })
      )
      // fetch new publish history
      .then(() => {
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
    // disable schedule if the item is dirty and needs to be saved
    // if the current version is already published
    return (
      props.item.dirty ||
      (props.item.publishing &&
        props.item.publishing.version === props.item.meta.version)
    );
  };

  let publishingDisabled = false;
  let schedulingDisabled = false;
  if (props.item && props.item.web && props.item.meta) {
    publishingDisabled = handlePublishDisable();
    schedulingDisabled = handleScheduleDisable();
  }

  return (
    <ButtonGroup className={styles.Actions}>
      <VersionSelector modelZUID={props.modelZUID} itemZUID={props.itemZUID} />

      {canPublish && (
        <ButtonGroup className={styles.Publish}>
          <Button
            className={styles.PublishButton}
            id="PublishButton"
            kind="secondary"
            disabled={publishingDisabled || false}
            onClick={handlePublish}
          >
            <i className="fas fa-cloud-upload-alt"></i>Publish{" "}
            <span>&nbsp;Version&nbsp;</span>
            {props.item.meta.version}
          </Button>
          <Button
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
        kind="save"
        disabled={props.saving || !props.item.dirty}
        onClick={props.onSave}
        id="SaveItemButton"
      >
        {props.saving ? (
          <FontAwesomeIcon icon={faSpinner} />
        ) : (
          <FontAwesomeIcon icon={faSave} />
        )}
        Save
        <span className={styles.HideVersion}>&nbsp;Version&nbsp;</span>
        <small>({props.platform.isMac ? "CMD" : "CTRL"} + S)</small>
      </Button>
    </ButtonGroup>
  );
});
