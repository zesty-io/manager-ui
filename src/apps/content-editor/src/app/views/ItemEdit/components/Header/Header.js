import { useState } from "react";
import cx from "classnames";
import { toggleDuoMode } from "shell/store/ui";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
import { LanguageSelector } from "./LanguageSelector";
import { useDispatch, useSelector } from "react-redux";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import ItemNavigation from "./ItemNavigation";

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
          />
        </div>
        <div className={styles.Right}>
          <div className={styles.Links}>
            {props.item.web.path && <LiveUrl item={props.item} />}

            {props.item.web.path && (
              <PreviewUrl item={props.item} instance={props.instance} />
            )}
          </div>

          <ToggleButton
            className={styles.ToggleButton}
            name={props.name}
            value={ui.duoMode}
            offValue="OFF"
            onValue="ON"
            onChange={() => {
              dispatch(toggleDuoMode());
            }}
          />

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
