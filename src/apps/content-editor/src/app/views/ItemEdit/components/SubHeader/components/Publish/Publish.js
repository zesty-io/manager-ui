import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { ScheduleFlyout } from "./ScheduleFlyout";

import styles from "./Publish.less";
export default React.memo(function Publish(props) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePublish = () => {
    setLoading(true);
    dispatch(
      publishItem(this.props.modelZUID, this.props.itemZUID, {
        version_num: this.props.item.meta.version
      })
    )
      .then(() => {
        notify({
          message: `Published version ${this.props.item.meta.version}`,
          kind: "save"
        });
      })
      .catch(() => {
        notify({
          message: `Error publishing version ${this.props.item.meta.version}`,
          kind: "error"
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOpenSchedule = () => setOpen(!open);

  console.log("// TODO check publish permissions");

  return (
    <>
      <ButtonGroup className={styles.Publish}>
        <Button id="PublishButton" kind="secondary" onClick={handlePublish}>
          Publish Version {props.item.meta.version}
        </Button>

        <Button
          id="PublishScheduleButton"
          className={`${styles.clock} ${
            props.item.scheduling && props.item.scheduling.isScheduled
              ? styles.Scheduled
              : ""
          }
          `}
          kind={open ? "tertiary" : "secondary"}
          onClick={handleOpenSchedule}
        >
          <FontAwesomeIcon icon={faCalendar} />
        </Button>

        <ScheduleFlyout
          isOpen={open}
          item={props.item}
          dispatch={dispatch}
          toggleOpen={handleOpenSchedule}
        />
      </ButtonGroup>
    </>
  );
});
