import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faWindowClose } from "@fortawesome/free-solid-svg-icons";

import { actions } from "shell/store/ui";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

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
        (setting.key === "headless_authorization_key" && setting.value) ||
        (setting.key === "authorization_key" && setting.value) 
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
      )}
    </Fragment>
  );
}
