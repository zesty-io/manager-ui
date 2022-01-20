import React, { Fragment } from "react";
import cx from "classnames";
import { useSelector } from "react-redux";

import { DuoModeToggle } from "./DuoModeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
import ItemNavigation from "./ItemNavigation";

import styles from "./Header.less";
export function Header(props) {
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

          {!ui.duoMode && (
            <div className={styles.ViewLinks}>
              <LiveUrl item={props.item} />
              <PreviewUrl item={props.item} instance={props.instance} />
            </div>
          )}
        </div>
        <div className={styles.Right}>
          <div className={styles.Actions}>
            <DuoModeToggle item={props.item} />
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
