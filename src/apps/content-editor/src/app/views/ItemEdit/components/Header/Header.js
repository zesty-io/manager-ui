import React, { useState } from "react";
import cx from "classnames";
import { toggleDuoMode } from "shell/store/ui";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
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
          <ToggleButton
            className={styles.ToggleButton}
            name={props.name}
            value={ui.duoMode}
            offValue="OFF"
            onValue={
              <React.Fragment>
                <FontAwesomeIcon icon={faDesktop} />
              </React.Fragment>
            }
            onChange={() => {
              dispatch(toggleDuoMode());
            }}
          />

          <ItemNavigation
            modelZUID={props.modelZUID}
            itemZUID={props.itemZUID}
            item={props.item}
            toggleDuoMode={ui.duoMode}
          />
        </div>
        <div className={styles.Right}>
          <div className={styles.Links}>
            {props.item.web.path && <LiveUrl item={props.item} />}

            {/* {props.item.web.path && (
              <PreviewUrl item={props.item} instance={props.instance} />
            )} */}
          </div>

          <div className={styles.Actions}>
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
