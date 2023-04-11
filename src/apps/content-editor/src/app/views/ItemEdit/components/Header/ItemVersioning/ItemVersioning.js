import { useEffect, useState } from "react";
import { useMetaKey } from "shell/hooks/useMetaKey";
import cx from "classnames";

import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BackupIcon from "@mui/icons-material/Backup";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import useMediaQuery from "@mui/material/useMediaQuery";
import LoadingButton from "@mui/lab/LoadingButton";

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
      // (props.item.scheduling && props.item.scheduling.isScheduled) ||
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
    <Stack direction="row" spacing={1} className={styles.Actions}>
      <VersionSelector modelZUID={props.modelZUID} itemZUID={props.itemZUID} />

      {canPublish && (
        <Stack direction="row" spacing={1} className={styles.Publish}>
          <LoadingButton
            variant="contained"
            color="primary"
            title="Save Version"
            disabled={!props.item.dirty}
            onClick={props.onSave}
            id="SaveItemButton"
            loading={props.saving}
            loadingPosition="start"
            startIcon={<SaveIcon fontSize="small" />}
          >
            <span className={styles.SaveVersion}>&nbsp;Save</span>
          </LoadingButton>
          <ButtonGroup
            variant="contained"
            sx={{
              ".MuiButtonGroup-grouped:not(:last-of-type)": {
                borderColor: "#039855",
              },
            }}
          >
            <Button
              variant="contained"
              color="success"
              title="Publish"
              id="PublishButton"
              disabled={publishingDisabled || false}
              onClick={handlePublish}
            >
              {publishing ? (
                <CircularProgress size="20px" />
              ) : cached ? (
                <CheckCircleIcon fontSize="small" title="CDN in sync" />
              ) : (
                <BackupIcon fontSize="small" title="CDN out of sync" />
              )}

              <span className={cx(styles.Hide, styles.PublishText)}>
                Publish Version &nbsp;{props.item.meta.version}
              </span>
            </Button>
            <Button
              variant="contained"
              color={open ? "primary" : "success"}
              title="Publish Schedule"
              id="PublishScheduleButton"
              disabled={schedulingDisabled || false}
              onClick={toggleScheduleModal}
              sx={{
                ...(props.item.scheduling &&
                  props.item.scheduling.isScheduled && {
                    backgroundColor: "warning.main",
                  }),
              }}
            >
              <CalendarMonthIcon fontSize="small" />
            </Button>
          </ButtonGroup>
          <ScheduleFlyout
            isOpen={open}
            item={props.item}
            dispatch={props.dispatch}
            toggleOpen={toggleScheduleModal}
          />
        </Stack>
      )}
    </Stack>
  );
}
