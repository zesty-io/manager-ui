import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faWindowClose } from "@fortawesome/free-solid-svg-icons";

import { actions } from "shell/store/ui";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import { PreviewUrl } from "../PreviewUrl";

import styles from "./DuoModeToggle.less";
export function DuoModeToggle(props) {
  const dispatch = useDispatch();

  const ui = useSelector((state) => state.ui);
  const instanceSettings = useSelector((state) => state.settings.instance);

  let unavailable = false;

  const slug = window.location.href.split("/").pop();
  unavailable =
    slug === "meta" &&
    slug === "head" &&
    slug === "preview" &&
    slug === "headless";

  // basic_content_api_key
  unavailable = instanceSettings.find((setting) => {
    // if any of these settings are present then DuoMode is una
    return (
      (setting.key === "basic_content_api_key" && setting.value) ||
      (setting.key === "headless_authorization_key" && setting.value) ||
      (setting.key === "authorization_key" && setting.value) ||
      (setting.key === "x_frame_options" && setting.value)
    );
  });

  return unavailable ? (
    props.item.web.path && (
      <PreviewUrl item={props.item} instance={props.instance} />
    )
  ) : (
    <ToggleButton
      title="Duo Mode Toggle"
      className={styles.ToggleButton}
      name={props.name}
      value={Number(ui.duoMode)}
      offValue={<FontAwesomeIcon icon={faWindowClose} />}
      onValue={<FontAwesomeIcon icon={faDesktop} />}
      onChange={(val) => {
        if (val == 1) {
          dispatch(actions.setDuoMode(true));
          dispatch(actions.setContentActions(false));
        } else {
          dispatch(actions.setDuoMode(false));
          dispatch(actions.setContentActions(true));
        }
      }}
    />
  );
}
