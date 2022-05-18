import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions } from "shell/store/ui";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CloseIcon from "@mui/icons-material/Close";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import { PreviewUrl } from "../PreviewUrl";
import { LiveUrl } from "../LiveUrl";

import styles from "./DuoModeToggle.less";
export function DuoModeToggle(props) {
  const dispatch = useDispatch();

  const ui = useSelector((state) => state.ui);
  const instanceSettings = useSelector((state) => state.settings.instance);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const slug = window.location.href.split("/").pop();
    let override =
      slug === "meta" &&
      slug === "head" &&
      slug === "preview" &&
      slug === "headless";

    override = instanceSettings.find((setting) => {
      // if any of these settings are present then DuoMode is unavailable
      return (
        (setting.key === "basic_content_api_key" && setting.value) ||
        (setting.key === "headless_authorization_key" && setting.value) ||
        (setting.key === "authorization_key" && setting.value) ||
        (setting.key === "x_frame_options" && setting.value)
      );
    });

    if (override) {
      dispatch(actions.setDuoMode(false));
    }

    setUnavailable(override);
  }, []);

  return (
    <Fragment>
      {unavailable ? (
        props.item.web.path && (
          <Fragment>
            <LiveUrl item={props.item} />
            <PreviewUrl item={props.item} />
          </Fragment>
        )
      ) : (
        <ToggleButtonGroup
          title="Duo Mode Toggle"
          color="secondary"
          value={Number(ui.duoMode)}
          exclusive
          size="small"
          onChange={(e, val) => {
            if (val === 1) {
              dispatch(actions.setDuoMode(true));
              dispatch(actions.setContentActions(false));
            } else if (val === 0) {
              dispatch(actions.setDuoMode(false));
              dispatch(actions.setContentActions(true));
            }
          }}
        >
          <ToggleButton value={0}>
            <CloseIcon CloseIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value={1}>
            <DesktopWindowsIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Fragment>
  );
}
