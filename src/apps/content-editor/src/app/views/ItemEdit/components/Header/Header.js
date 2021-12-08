import React from "react";
import cx from "classnames";

import { actions } from "shell/store/ui";

import { LanguageSelector } from "./LanguageSelector";
import { useDispatch, useSelector } from "react-redux";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import ItemNavigation from "./ItemNavigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";

import styles from "./Header.less";
export function Header(props) {
  const dispatch = useDispatch();
  const ui = useSelector((state) => state.ui);

  return (
    <header className={styles.Header}>
      <div className={cx(styles.Split)}>
        <div className={styles.Left}>
          <ItemNavigation
            modelZUID={props.modelZUID}
            itemZUID={props.itemZUID}
            item={props.item}
            toggleDuoMode={ui.duoMode}
          />
        </div>
        <div className={styles.Right}>
          <div className={styles.Actions}>
            <ToggleButton
              className={styles.ToggleButton}
              name={props.name}
              value={Number(ui.duoMode)}
              offValue="OFF"
              onValue={
                <React.Fragment>
                  <FontAwesomeIcon icon={faDesktop} />
                </React.Fragment>
              }
              onChange={(val) => {
                if (val == 1) {
                  dispatch(actions.setDuoMode(true));
                  dispatch(actions.setContentActions(true));
                } else {
                  dispatch(actions.setDuoMode(false));
                  // dispatch(actions.setContentActions(false));
                }
              }}
            />
            <LanguageSelector
              className={styles.I18N}
              itemZUID={props.itemZUID}
            />
            {props.children}
          </div>
        </div>
      </div>
    </header>
  );
}
